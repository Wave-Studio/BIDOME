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
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
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
			if (await doPermCheck(ctx.member!, botState.channel!) || queue.queue[0].requestedBy == ctx.author.id) {
				// Convert these into variables that don't change
				const isSongLoop = !!queue.songLoop;
				const isQueueLoop = !!queue.queueLoop;

				queue.songLoop = false;
				queue.queueLoop = false;

				await queue.player.stop();

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
								"You are not an `ADMINISTRATOR`, Alone in the channel, or the song requester",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
