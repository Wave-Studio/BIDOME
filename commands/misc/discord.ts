import { Command, CommandContext, Embed } from "harmony";

export class command extends Command {
	name = "discord";
	category = "misc";
	description = "Get a link to bidome's discord";
	usage = "Discord";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user?.avatarURL(),
				},
				description:
					"To access Bidome related channels please DM me after joining our [**Discord**](https://discord.gg/Y4USEwV)",
			}).setColor("random"),
		});
	}
}
