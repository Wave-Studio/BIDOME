import { Command, CommandContext, Embed, User } from "harmony";

export default class TicTacToe extends Command {
	name = "tic-tac-toe";
	aliases = ["ttt"]
	description = "Play tic-tac-toe with a friend or a computer!";
	usage = "[user's mention or id]";
	async execute(ctx: CommandContext) {
		let targetPlayer: "ai" | User = "ai";
		if (ctx.argString != "") {
			const mention = ctx.argString.split(" ")[0];
			const id = /<@!?[0-9]{1,}>/.test(mention) ? mention.replace(">", "").replace(/<@!?/g, "") : mention;
			targetPlayer = await ctx.message.client.users.fetch(id);
		}
		
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.message.client.user!.avatarURL(),
				},
				title: "Tic Tac Toe",
				description:
					`Target player: ${targetPlayer == "ai" ? "AI" : targetPlayer.tag}`,
			}).setColor("random")],
		})
	}
}