import { Command, CommandContext, Embed } from "harmony";
import { supabase } from "supabase";

export default class Prefix extends Command {
	name = "prefix";
	category = "misc";
	description = "Get the bot's prefix";
	usage = "Prefix";
	async execute(ctx: CommandContext) {
		const { data } = await supabase.from("data").select("prefix").eq("server_id", ctx.guild!.id);

		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user!.avatarURL(),
				},
				description:
					`My current prefix for this server is: \`\` ${data![0].prefix} \`\``
			}).setColor("random")],
		});
	}
}
