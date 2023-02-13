import { Command, CommandContext, Embed } from "harmony";
import { getPrefixes } from "supabase";

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
				description: `My current prefixes for this server are: \n\`\`\`${(await getPrefixes(ctx.guild!.id)).join("\n")} \n\`\`\`\n`
			}).setColor("random")],
		});
	}
}
