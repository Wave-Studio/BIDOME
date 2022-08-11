import {
	Command,
	CommandContext,
	Embed,
} from "harmony";
import { resetCache } from "supabase";

export default class ClearCache extends Command {
	name = "clearcache";
	aliases = ["cc"];
	ownerOnly = true;
	category = "dev";
	description = "Clear the prefix cache";
	usage = "clearcache";
	async execute(ctx: CommandContext) {
		resetCache();
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome Reload",
					description: "I have cleared the cache! Responses may be slightly delayed until the cache is rebuilt.",
				}).setColor("random"),
			],
			components: [],
		});
	}
}
