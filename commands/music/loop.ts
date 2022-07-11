import { Command, CommandContext, Embed } from "harmony";
import { queues, doPermCheck } from "queue";

export default class Loop extends Command {
	name = "loop";
	aliases = ["replay", "l"];
	category = "music";
	description = "Loop the current song";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const queue = queues.get(ctx.guild.id);
		if (queue == undefined) {
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
		} else {
			const queue = queues.get(ctx.guild!.id)!;
			const states = await ctx.guild!.voiceStates.get(ctx.author.id);
			if (await doPermCheck(ctx.member!, states!.channel!)) {
				const isQueueLoopEnabled = queue.queueLoop;

				if (isQueueLoopEnabled) {
					queue.queueLoop = false;
				}

				queue.songLoop = !queue.songLoop;

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Toggled loop",
							description: `Song looping is now ${
								queue.songLoop ? "Enabled" : "Disabled"
							} ${
								isQueueLoopEnabled ? "and queue looping is now disabled" : ""
							}`,
						}).setColor("green"),
					],
				});
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to toggle loop",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
