import { Command, CommandContext, Embed } from "harmony";
import ms from "https://esm.sh/ms";

export class command extends Command {
	name = "timestamp";
	aliases = ["ts", "time"];
	category = "misc";
	description = "Create a discord timestamp";
	async execute(ctx: CommandContext) {
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Invalid command use!",
					description: "Please provide a timestamp such as `4h` or `1d`",
				}).setColor("random"),
			});
		} else {
			try {
				ms(ctx.argString);
			} catch {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Invalid timestamp!",
						description:
							"Please provide a valid timestamp such as `4h` or `1d`",
					}).setColor("random"),
				});
				return;
			}
			const timestamp = ms(ctx.argString);
			const time = (new Date().getTime() / 1000 + timestamp / 1000).toFixed(0);
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Here is your timestamp:",
					description: ["d", "D", "t", "T", "f", "F", "R"]
						.map((v) => `<t:${time}:${v}> - \`<t:${time}:${v}>\``)
						.join("\n"),
				}).setColor("random"),
			});
		}
	}
}
