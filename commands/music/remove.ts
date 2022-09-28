import { Command, CommandContext, Embed } from "harmony";
import { queues, doPermCheck } from "queue";
import { removeDiscordFormatting } from "tools";

export default class Remove extends Command {
	name = "remove";
	aliases = ["rm"];
	category = "music";
	description = "Remove a song from the queue";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (queues.has(ctx.guild!.id) && (botState == undefined || botState.channel == undefined)) {
			queues.get(ctx.guild!.id)!.deleteQueue();
		}
		
		const queue = queues.get(ctx.guild.id);
		if (queue == undefined || botState == undefined || botState.channel == undefined) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Not currently playing!",
						description: "I am not currently playing anything!",
					}).setColor("red"),
				],
			});

			if (queue != undefined) {
				queue.deleteQueue();
			}
		} else {
			const queue = queues.get(ctx.guild!.id)!;
			if (await doPermCheck(ctx.member!, botState.channel)) {
				if (queue.queue.length < 2) {
					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Unable to remove",
								description:
									"There are no songs currently waiting to be played!",
							}).setColor("red"),
						],
					});
				} else {
					if (
						ctx.argString == "" ||
						isNaN(parseInt(ctx.argString)) ||
						parseInt(ctx.argString) < 1 ||
						parseInt(ctx.argString) > queue.queue.length
					) {
						await ctx.message.reply({
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Invalid argument",
									description: `Please select the song's current position (1-${
										queue.queue.length - 1
									})`,
								}).setColor("red"),
							],
						});
					} else {
						const position = parseInt(ctx.argString);
						const [song] = queue.queue.splice(position, 1);
						await ctx.message.reply({
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Removed song",
									description: `Removed [${removeDiscordFormatting(
										song.title
									)}](${song.url}) from the queue!`,
								}).setColor("green"),
							],
						});
					}
				}
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to remove song",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
