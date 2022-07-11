import { Command, CommandContext, Embed } from "harmony";
import { queues, doPermCheck } from "queue";

export default class QueueLoop extends Command {
	name = "queueloop";
	aliases = ["replayqueue", "qloop", "ql"];
	category = "music";
	description = "Loop the current queue";

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
				const isSongLoopEnabled = queue.songLoop;

				if (isSongLoopEnabled) {
					queue.songLoop = false;
				}

				queue.queueLoop = !queue.queueLoop;

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Toggled queue loop",
							description: `Queue looping is now ${
								queue.queueLoop ? "Enabled" : "Disabled"
							} ${
								isSongLoopEnabled ? "and song looping is now disabled" : ""
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
							title: "Unable to toggle queue loop",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
