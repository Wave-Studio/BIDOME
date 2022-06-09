import { Command, CommandContext, Embed } from "harmony";

export class command extends Command {
	name = "say";
	aliases = ["echo"];
	userPermissions = "ADMINISTRATOR";
	description = "Make the bot say something";
	category = "staff";
	usage = "Say <message>";
	async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Bidome say",
					description: `You need to provide a message`,
				}).setColor("random"),
			});
		} else {
			await ctx.message.reply(ctx.argString, {
				allowedMentions: {
					parse: [],
				},
			});
		}
	}
}
