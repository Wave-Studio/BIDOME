import {
	Extension,
	Webhook,
	event,
	Message,
	ChannelTypes,
	Emoji,
	Embed,
} from "harmony";
import { getUserProfilePicture } from "cache";
import { encode } from "https://deno.land/std@0.175.0/encoding/base64.ts";
import { getEmojiByName } from "emoji";
import { truncateString } from "tools";

interface ServerEmoteList {
	name: string;
	id: string;
	animated: boolean;
}

export default class BetterEmotes extends Extension {
	name = "BetterEmotes";

	private serverEmoteCache: Map<string, ServerEmoteList[]> = new Map();

	@event("messageCreate")
	async messageCreate(_: Extension, msg: Message) {
		if (Deno.env.get("IS_DEV") != "true") return;
		if (
			msg.author.bot ||
			msg.guild == undefined ||
			msg.channel.type != ChannelTypes.GUILD_TEXT ||
			!msg.content.includes(":")
		)
			return;

		const emojiRegex = /(?!<a?):[a-zA-Z0-9_]+:(?![0-9]+>)/g;
		const emojis = msg.content.match(emojiRegex);

		if (emojis == null) return;

		const webhooks = await msg.channel.fetchWebhooks();

		if (webhooks.length >= 8) return;

		let webhook = webhooks.find((w) => w.name?.toLowerCase() == "bidome bot" && w.user?.id == msg.client.user?.id);
		// TODO: Make this work
		const serverEmojisArray = this.serverEmoteCache.has(msg.guild!.id)
			? this.serverEmoteCache.get(msg.guild!.id)
			: (await msg.guild.emojis.fetchAll()).map(({ name, id, animated }) => ({
					name: name!,
					id: id!,
					animated: animated!,
			  }));

		this.serverEmoteCache.set(
			msg.guild!.id,
			serverEmojisArray as ServerEmoteList[]
		);
		msg.guild.emojis.fetchAll();

		if (webhook == undefined) {
			const avatar = await getUserProfilePicture(msg.client.user!.avatarURL());
			const avatarB64 = encode(avatar.buffer);

			webhook = await Webhook.create(msg.channel, msg.client, {
				name: "Bidome Bot",
				avatar: `data:image/png;base64,${avatarB64}`,
			});
		}

		let message = msg.content;

		for (const emote of serverEmojisArray ?? []) {
			message = message.replace(
				new RegExp(`(?!<a?):${emote.name}:(?![0-9]+>)`, "g"),
				`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`
			);
		}

		if (message == msg.content) return;

		const messageEmbeds: Embed[] = [];

		if (msg.messageReference != undefined) {
			const refMsg = await msg.channel.messages.fetch(
				msg.messageReference.message_id!
			);
			if (refMsg != undefined) {
				messageEmbeds.push(new Embed({
					author: {
						name: `Replying to: ${refMsg.author.tag}`,
						icon_url: refMsg.author.avatarURL(),
					},
					description: `${truncateString(refMsg.content, 100)} \n\n[Click to jump to message](${refMsg.url})`,
				}).setColor("random"));
			} 
		}

		await webhook.send(message, {
			avatar: msg.author.avatarURL(),
			name: msg.author.username,
			embeds: [...messageEmbeds, ...msg.attachments.map((a) =>
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: msg.client.user!.avatarURL(),
					},
					title: `${getEmojiByName(
						/.\.(png|webm|gif|jpg|jpeg)/i.test(a.filename)
							? "frame_with_picture"
							: "open_file_folder"
					)} ${a.filename}`,
					url: a.url,
					image: {
						url: /.\.(png|webm|gif|jpg|jpeg)/i.test(a.filename)
							? a.url
							: undefined,
					},
				}).setColor("random")
			)],
			allowedMentions: {
				parse: [],
				replied_user: false,
				roles: [],
				users: [],
			}
		});
		await msg.delete();
	}

	@event("guildEmojiAdd")
	async guildEmojiAdd(_: Extension, emoji: Emoji) {
		if (emoji == undefined) return;
		if (emoji.guild == undefined) return;
		const serverEmojisArray = this.serverEmoteCache.has(emoji.guild.id)
			? this.serverEmoteCache.get(emoji.guild.id)
			: (await emoji.guild.emojis.fetchAll()).map(({ name, id, animated }) => ({
					name: name!,
					id: id!,
					animated: animated!,
			  }));

		serverEmojisArray!.push({
			name: emoji.name!,
			id: emoji.id!,
			animated: emoji.animated!,
		});

		this.serverEmoteCache.set(emoji.guild.id, serverEmojisArray!);
	}

	@event("guildEmojiDelete")
	async guildEmojiDelete(_: Extension, emoji: Emoji) {
		if (emoji == undefined) return;
		if (emoji.guild == undefined) return;
		const serverEmojisArray = this.serverEmoteCache.has(emoji.guild.id)
			? this.serverEmoteCache.get(emoji.guild.id)
			: (await emoji.guild.emojis.fetchAll()).map(({ name, id, animated }) => ({
					name: name!,
					id: id!,
					animated: animated!,
			  }));

		this.serverEmoteCache.set(
			emoji.guild.id,
			serverEmojisArray!.filter((e) => e.id != emoji.id)
		);
	}

	@event("guildEmojiUpdate")
	async guildEmojiUpdate(_: Extension, before: Emoji, after: Emoji) {
		if (before == undefined || after == undefined) return;
		if (before.guild == undefined) return;
		let serverEmojisArray = this.serverEmoteCache.has(before.guild.id)
			? this.serverEmoteCache.get(before.guild.id)
			: (await before.guild.emojis.fetchAll()).map(
					({ name, id, animated }) => ({
						name: name!,
						id: id!,
						animated: animated!,
					})
			  );

		serverEmojisArray = serverEmojisArray!.filter((e) => e.id != before.id);
		serverEmojisArray.push({
			name: after.name!,
			id: after.id!,
			animated: after.animated!,
		});

		this.serverEmoteCache.set(before.guild.id, serverEmojisArray);
	}
}
