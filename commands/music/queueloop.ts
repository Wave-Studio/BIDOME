import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, LoopType, queues } from "queue";

export default class QueueLoop extends Command {
	name = "queueloop";
	aliases = ["replayqueue", "qloop", "ql"];
	category = "music";
	description = "Loop the current queue";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (
			queues.has(ctx.guild!.id) &&
			(botState == undefined || botState.channel == undefined)
		) {
			queues.get(ctx.guild!.id)!.deleteQueue();
		}

		const queue = queues.get(ctx.guild.id);
		if (
			queue == undefined ||
			botState == undefined ||
			botState.channel == undefined
		) {
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
				const loopType = queue.loopType;
				const loopTypeEnum = queue.loop;
				const isLoopDisabled = queue.loop != LoopType.QUEUE;

				if (isLoopDisabled) {
					queue.loop = LoopType.QUEUE;
				} else {
					queue.loop = LoopType.OFF;
				}

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Toggled loop",
							description: `Queue looping is now ${
								loopTypeEnum == LoopType.QUEUE
									? "Enabled"
									: "Disabled"
							} ${
								loopTypeEnum != LoopType.OFF &&
									loopTypeEnum != LoopType.QUEUE
									? `and ${loopType}ing is now disabled`
									: ""
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
