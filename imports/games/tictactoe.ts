import { getRandomInteger } from "../tools.ts";

export const currentGames = new Map<string, TicTacToeGame>();

export class TicTacToeGame {
	public x: string;
	public o: string;
	public isPlayingWithAI = false;
	public waitingToAcceptGame = true;
	public currentPlayersTurn: 'x' | 'o';

	constructor(player1: string, player2: string) {
		this.currentPlayersTurn = ['x', 'o'][getRandomInteger(0, 1)] as 'x' | 'o';
		const isP1X = getRandomInteger(1, 2) == 1;
		if (isP1X) {
			this.x = player1;
			this.o = player2;
		} else {
			this.o = player1;
			this.x = player2;
		}

		if (player1 == "ai" || player2 == "ai") {
			this.isPlayingWithAI = true;
		}
	}
}