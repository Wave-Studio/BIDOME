import { Command, CommandContext, Embed } from "harmony";

export default class Invite extends Command {
	name = "invite";
	category = "misc";
	description = "Get the bot's invite";
	usage = "Invite";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user!.avatarURL(),
				},
				description:
					"To invite Bidome to your server use [**this invite**](https://discord.com/api/oauth2/authorize?client_id=778670182956531773&permissions=8&scope=applications.commands%20bot)",
			}).setColor("random")],
		});
	}
}
