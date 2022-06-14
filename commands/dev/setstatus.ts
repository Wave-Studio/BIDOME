import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from "harmony";
import { format } from "tools";

export default class SetStatus extends Command {
	name = "setstatus";
	ownerOnly = true;
	category = "dev";
	description = "Change the bot's status";
	usage = "Setstatus <status>";
	async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bot status",
					description: "Please provide a status to change it to!",
				}).setColor("random")],
			});
		} else {
			const now = Date.now();
			const message = await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bot status",
					description: "Please select the status type!",
					footer: {
						text: "This will time out in 30 seconds!",
					},
				}).setColor("random")],
				components: [
					{
						type: 1,
						components: [
							"PLAYING",
							"WATCHING",
							"LISTENING",
							"COMPETING",
						].map((status) => ({
							type: 2,
							label: format(status),
							style: "BLURPLE",
							customID: `${status.toLowerCase()}-${now}`,
						})),
					},
				],
			});

			const choice = await ctx.client.waitFor(
				"interactionCreate",
				(i) =>
					isMessageComponentInteraction(i) &&
					i.customID.endsWith(`-${now}`) &&
					i.user.id === ctx.author.id,
				30 * 1000,
			);
			if (!choice[0]) {
				await message.edit(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bot status",
						description: "Status change timed out!",
					}).setColor("random")],
					components: [],
				});
				return;
			} else {
				if (!isMessageComponentInteraction(choice[0])) return;
				const type = choice[0].customID.split("-")[0].toUpperCase() as
					| "PLAYING"
					| "WATCHING"
					| "LISTENING"
					| "COMPETING";
				ctx.client.setPresence({
					type: type,
					name: ctx.argString,
					status: ctx.client.presence.status,
				});
				await message.edit(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bot status",
						description: "Status has been changed!",
					}).setColor("random")],
					components: [],
				});
			}
		}
	}
}
