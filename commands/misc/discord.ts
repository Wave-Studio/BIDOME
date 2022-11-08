import { Command, CommandContext, Embed } from "harmony";

export default class Discord extends Command {
	name = "discord";
	category = "misc";
	description = "Get a link to bidome's discord";
	usage = "Discord";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user!.avatarURL(),
				},
				description:
					"Bidome's support and general chat is located inside of [Wave Studios](https://discord.gg/yrwUpMcfcR)",
			}).setColor("random")],
		});
	}
}
