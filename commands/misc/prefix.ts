import { Command, CommandContext, Embed } from "harmony";
import { Database } from "database";

export default class Prefix extends Command {
	name = "prefix";
	category = "misc";
	description = "Get the bot's prefix";
	usage = "Prefix";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user!.avatarURL(),
				},
				description:
					`My current prefix for this server is: \`\` ${Database.get(`guilds.${ctx.guild!.id}.prefix`)} \`\``
			}).setColor("random")],
		});
	}
}
