import { Command, CommandContext, Embed } from "harmony";
import { toMs } from "tools";

export default class Timestamp extends Command {
	name = "timestamp";
	aliases = ["ts", "time"];
	category = "misc";
	description = "Create a discord timestamp";
	async execute(ctx: CommandContext) {
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					title: "Invalid command use!",
					description:
						"Please provide a timestamp such as `4h`, `1d`, or `1y1d`",
				}).setColor("random")],
			});
		} else {
			const timestamp = toMs(ctx.argString);
			if (timestamp < 0) {
				await ctx.message.reply(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Invalid timestamp!",
						description:
							"Please provide a valid timestamp such as `4h` or `1d`",
					}).setColor("random")],
				});
			} else {
				const time = (new Date().getTime() / 1000 + timestamp / 1000)
					.toFixed(
						0,
					);
				await ctx.message.reply(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Here is your timestamp:",
						description: ["d", "D", "t", "T", "f", "F", "R"]
							.map((v) =>
								`<t:${time}:${v}> - \`<t:${time}:${v}>\``
							)
							.join("\n"),
					}).setColor("random")],
				});
			}
		}
	}
}
