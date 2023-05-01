import { Command, CommandContext, Embed, User } from "harmony";
import { TicTacToeGame, currentGames } from "tictactoe"

export default class TicTacToe extends Command {
	name = "tictactoe";
	aliases = ["ttt", "tic-tac-toe"];
	description = "Play tic-tac-toe with a friend or a computer!";
	usage = "[user's mention or id]";
	category = "games";
	async execute(ctx: CommandContext) {
		let targetPlayer: "ai" | User = "ai";
		const userId =
			ctx.argString != ""
				? /<@!?[0-9]{17,19}>/.test(ctx.argString.trim())
					? ctx.message.mentions.users.first()!.id
					: ctx.argString
				: ctx.member!.id;
		const user =
			(await ctx.guild!.members.resolve(userId))!;
		
		targetPlayer = user.id == ctx.member!.id ? "ai" : user.user;
		
		if (targetPlayer != "ai") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Error running command",
						description: `Unfortunately we currently only support playing against the ai!`,
					}).setColor("red"),
				],
			});
			return;
		} 

		const game = new TicTacToeGame(ctx.author, targetPlayer, ctx.client);

		const { id } = await ctx.message.reply(undefined, {
			embeds: [
				game.Embed
			],
			components: game.boardState
		});

		currentGames.set(id, game);
	}
}
