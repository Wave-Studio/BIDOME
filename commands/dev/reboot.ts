import { Command, CommandContext, Embed } from "harmony";
import { getEmote } from "i18n";

export default class Reboot extends Command {
	name = "reboot";
	aliases = ["restart"];
	category = "dev";
	description = "Restarts the bot";
	usage = "reboot";
	ownerOnly = true;

	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user!.avatarURL(),
				},
				description: `Restarting bot ${getEmote("typing")}`,
			}).setColor("random")],
		});

		if (self.postMessage != undefined) {
			self.postMessage({ type: "exit" });
		} else {
			Deno.exit(0);
		}
	}
}
