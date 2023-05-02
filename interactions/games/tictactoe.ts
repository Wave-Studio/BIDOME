import {
	MessageComponentInteraction,
	Embed,
	User,
	InteractionResponseType,
} from "harmony";
import { currentGames } from "tictactoe";
import { createEmbedFromLangData, getUserLanguage } from "i18n";

export default async function tictactoe(i: MessageComponentInteraction) {
	if (i.customID.startsWith("ttt")) {
		const game = currentGames.get(i.message.id);
		const lang = await getUserLanguage(i.user.id);

		if (game == undefined) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.tictactoe.unknowngame"
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}).setColor("red"),
				],
			});
		} else {
			if ((game[game.currentPlayersTurn] as User).id != i.user.id) {
				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"interactions.tictactoe.notyours"
							),
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}).setColor("red"),
					],
				});
			} else {
				const [x, y] = i.customID
					.substring("ttt-".length)
					.split("-")
					.map((n) => parseInt(n));
				const result = game.play(x, y);

				if (!result) {
					await i.respond({
						ephemeral: true,
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"interactions.tictactoe.cantplay"
								),
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
							}).setColor("red"),
						],
					});
				} else {
					i.message.edit({
						embeds: [game.Embed],
						components: game.boardState,
					});
					
					await i.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});

					if (game.checkForWin() != false) {
						currentGames.delete(i.message.id);
					}
				}
			}
		}

		return false;
	}
}
