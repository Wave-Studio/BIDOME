import { Command, CommandContext, Embed } from "harmony";

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
				description:
					"Restarting bot <a:typing:779775412829028373>",
			}).setColor("random")],
		});

		if (self.postMessage != undefined) {
			self.postMessage({ type: "exit" });
		} else {
			Deno.exit(0);
		}
	}
}
