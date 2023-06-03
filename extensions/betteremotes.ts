import {
	ApplicationCommand,
	ChannelTypes,
	Embed,
	Emoji,
	event,
	Extension,
	Guild,
	isApplicationCommandInteraction,
	Message,
	MessageAttachment,
	Webhook,
} from "harmony";
import { getDiscordImage } from "cache";
import { encode } from "https://deno.land/std@0.175.0/encoding/base64.ts";
import { getEmojiByName } from "emoji";
import { truncateString } from "tools";
// Yes, I really only use this for one purpose
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const dataImage = new Image(100, 1);
const dataImageExported = await dataImage.encode();

interface ServerEmoteList {
	name: string;
	id: string;
	animated: boolean;
	available: boolean;
}

export const slashCommands: ApplicationCommand[] = [
	{
		name: "Delete Message",
		type: "MESSAGE",
		handler: async (i) => {
			if (!isApplicationCommandInteraction(i)) return;
			const message = i.targetMessage;
			const authorIsBot = message?.webhookID != undefined;

			if (!authorIsBot) {
				await i.respond({
					embeds: [
						new Embed({
							title: "Unable to delete",
							description:
								"I can only delete emotified messages sent by myself.",
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}).setColor("red"),
					],
					ephemeral: true,
				});
			} else {
				if (
					message.attachments.filter(
						(a) => a.filename.toLowerCase() == `b-data-${i.user.id}.png`
					) ||
					i.member?.permissions.has("MANAGE_MESSAGES")
				) {
					await message.delete();
					await i.respond({
						ephemeral: true,
						embeds: [
							new Embed({
								title: "Message deleted",
								description: "This message has been deleted!",
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
							}).setColor("green"),
						],
					});
				} else {
					await i.respond({
						embeds: [
							new Embed({
								title: "Unable to delete",
								description: "You did not send this message!",
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
							}).setColor("red"),
						],
						ephemeral: true,
					});
				}
			}

			await i.respond({
				embeds: [
					new Embed({
						title: "Work in progress",
						description:
							"This feature is still a work in progress, please wait for it to be finished.",
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}).setColor("random"),
				],
				ephemeral: true,
			});
		},
	},
];

export default class BetterEmotes extends Extension {
	name = "BetterEmotes";

	private serverEmoteCache: Map<string, ServerEmoteList[]> = new Map();

	async cacheServerEmotes(guild: Guild) {
		if (this.serverEmoteCache.has(guild.id)) return;
		const emotes = (await guild.emojis.fetchAll()).map(
			({ name, id, animated, available }) => ({
				name: name!,
				id: id!,
				animated: animated!,
				available: available!,
			})
		);
		this.serverEmoteCache.set(guild.id, emotes);
	}

	@event("messageCreate")
	async messageCreate(_: Extension, msg: Message) {
		if (Deno.env.get("IS_DEV") != "true") return;
		if (
			msg.author.bot ||
			msg.guild == undefined ||
			msg.channel.type != ChannelTypes.GUILD_TEXT ||
			!msg.content.includes(":")
		) {
			return;
		}

		const emojiRegex = /(?!<a?):[a-zA-Z0-9_]+:(?![0-9]+>)/g;
		const emojis = msg.content.match(emojiRegex);

		if (emojis == null) return;

		const webhooks = await msg.channel.fetchWebhooks();

		let webhook = webhooks.find(
			(w) => w.name?.toLowerCase() == "bidome bot" && w.token != undefined
		);

		const mutualGuilds = [];

		for await (const guild of msg.client.guilds) {
			const user = await guild.members.resolve(msg.author.id);
			if (user != undefined) {
				await this.cacheServerEmotes(guild);
				mutualGuilds.push(guild.id);
			}
		}

		const validEmojisArray: ServerEmoteList[] = [];

		for (const guild of mutualGuilds) {
			for (const emoji of this.serverEmoteCache.get(guild) ?? []) {
				const sameNamedEmotes = validEmojisArray.filter(
					(e) => e.name == emoji.name
				);
				if (sameNamedEmotes.length > 0) {
					validEmojisArray.push({
						...emoji,
						name: `${emoji.name}~${sameNamedEmotes.length - 1}`,
					});
				} else {
					validEmojisArray.push(emoji);
				}
			}
		}

		let message = msg.content;

		for (const emote of validEmojisArray ?? []) {
			if (!emote.available) continue;
			message = message.replace(
				new RegExp(`(?!<a?):${emote.name}:(?![0-9]+>)`, "g"),
				`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`
			);
		}

		if (message == msg.content) return;

		if (webhook == undefined) {
			const avatar = await getDiscordImage(msg.client.user!.avatarURL());

			const avatarB64 = encode(avatar);

			webhook = await Webhook.create(msg.channel, msg.client, {
				name: "Bidome Bot",
				avatar: `data:image/png;base64,${avatarB64}`,
			});
		}

		const messageEmbeds: Embed[] = [];

		if (msg.messageReference != undefined) {
			const refMsg = await msg.channel.messages.fetch(
				msg.messageReference.message_id!
			);
			if (refMsg != undefined) {
				messageEmbeds.push(
					new Embed({
						author: {
							name: `Replying to: ${refMsg.author.tag}`,
							icon_url: refMsg.author.avatarURL(),
						},
						description: `${truncateString(
							refMsg.content,
							100
						)} \n\n[Click to jump to message](${refMsg.url})`,
						image: msg.attachments.length > 0 ? msg.attachments[0] : undefined,
					}).setColor("random")
				);
			}
		}

		await webhook.send(message, {
			avatar: msg.author.avatarURL(),
			name: msg.member?.nick ?? msg.author.username,
			embeds: [
				...messageEmbeds,
				...msg.attachments.map((a) =>
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
				),
			],
			allowedMentions: {
				parse: [],
				replied_user: false,
				roles: [],
				users: [],
			},
			files: [
				new MessageAttachment(`B-Data-${msg.author.id}.png`, dataImageExported),
			],
		});

		await msg.delete();
	}

	@event("guildEmojiAdd")
	async guildEmojiAdd(_: Extension, emoji: Emoji) {
		if (emoji == undefined) return;
		if (emoji.guild == undefined) return;
		const serverEmojisArray = this.serverEmoteCache.has(emoji.guild.id)
			? this.serverEmoteCache.get(emoji.guild.id)
			: (await emoji.guild.emojis.fetchAll()).map(
					({ name, id, animated, available }) => ({
						name: name!,
						id: id!,
						animated: animated!,
						available: available!,
					})
			  );

		serverEmojisArray!.push({
			name: emoji.name!,
			id: emoji.id!,
			animated: emoji.animated!,
			available: emoji.available!,
		});

		this.serverEmoteCache.set(emoji.guild.id, serverEmojisArray!);
	}

	@event("guildEmojiDelete")
	async guildEmojiDelete(_: Extension, emoji: Emoji) {
		if (emoji == undefined) return;
		if (emoji.guild == undefined) return;
		const serverEmojisArray = this.serverEmoteCache.has(emoji.guild.id)
			? this.serverEmoteCache.get(emoji.guild.id)
			: (await emoji.guild.emojis.fetchAll()).map(
					({ name, id, animated, available }) => ({
						name: name!,
						id: id!,
						animated: animated!,
						available: available!,
					})
			  );

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
					({ name, id, animated, available }) => ({
						name: name!,
						id: id!,
						animated: animated!,
						available: available!,
					})
			  );

		serverEmojisArray = serverEmojisArray!.filter((e) => e.id != before.id);
		serverEmojisArray.push({
			name: after.name!,
			id: after.id!,
			animated: after.animated!,
			available: after.available!,
		});

		this.serverEmoteCache.set(before.guild.id, serverEmojisArray);
	}
}
