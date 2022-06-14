import { Command, CommandContext, Embed } from "harmony";
import { queues } from "queue";

export default class Queue extends Command {
	name = "nowplaying";
	aliases = ["np", "playing"];
	category = "music";
	description = "View the current song";

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
			await ctx.message.reply(undefined, queue.nowPlayingMessage);
		}
	}
}
