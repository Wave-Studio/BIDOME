import { Command, CommandContext, Embed } from "harmony";

export default class Status extends Command {
	name = "status";
	category = "misc";
	description = "Suggest statuses to be added to the bot";
	usage = "Status";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user!.avatarURL(),
				},
				description:
					"You can suggest statuses on our [**Github**](https://github.com/quick007/BIDOME)",
			}).setColor("random")],
		});
	}
}
