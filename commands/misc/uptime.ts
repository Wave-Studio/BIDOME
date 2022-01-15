import { Command, CommandContext, Embed } from "harmony";
import { formatMs } from "tools";

export class command extends Command {
	name = "uptime";
	category = "misc";
	description = "See bot uptime!";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user?.avatarURL(),
				},
				title: "Bot uptime",
				description: `Bidome has been online for \`${formatMs(
					ctx.client.uptime
				)}\``,
			}).setColor("random"),
		});
	}
}
