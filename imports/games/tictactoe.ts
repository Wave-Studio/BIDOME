import { getRandomNumber } from "../tools.ts";

export const currentGames = new Map<string, TicTacToeGame>();

export const TicTacToeGame {
	public x: string;
	public o: string;
	public isPlayingWithAI: boolean;
	public waitingToAcceptGame: boolean = true;
	public currentPlayersTurn: 'x' | 'o';

	constructor(player1: string, player2: string) {
		currentPlayersTurn = ['x', 'o'][getRandomNumber(0, 1)]
		const isP1X = getRandomNumber(1, 2) == 1;
		if (isP1X) {
			x = player1;
			y = player2;
		} else {
			y = player1;
			x = player2;
		}

		if (player1 == "ai" || player2 == "ai") {
			isPlayingWithAI = true;
		}
	}
}