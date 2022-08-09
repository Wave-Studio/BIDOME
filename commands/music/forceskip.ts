import { Command, CommandContext, Embed } from "harmony";
import { queues, doPermCheck } from "queue";

export default class ForceSkip extends Command {
	name = "forceskip";
	aliases = ["fs"];
	category = "music";
	description = "Skip the current song without a vote";

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
				// Convert these into variables that don't change
				const isSongLoop = !!queue.songLoop;
				const isQueueLoop = !!queue.queueLoop;

				queue.songLoop = false;
				queue.queueLoop = false;

				queue.player.seek(queue.queue[0].msLength - 100);

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Skipped",
							description:
								"I have skipped the current song",
						}).setColor("green"),
					],
				});

				// Reset the loop settings
				queue.songLoop = isSongLoop;
				queue.queueLoop = isQueueLoop;
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to skip",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
