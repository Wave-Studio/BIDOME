import { Command, CommandContext, Embed } from "harmony";
import { queues, doPermCheck } from "queue";

export default class Stop extends Command {
	name = "stop";
	aliases = ["disconnect", "dc", "fuckoff", "leave", "pleaseshutthefuckupnow"];
	category = "music";
	description = "Disconnects from the voice channel and stops playing";

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
				queue.deleteQueue(true);
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Stopped playing!",
							description: "I have left the channel and stopped playing!",
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
							title: "Unable to disconnect",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
