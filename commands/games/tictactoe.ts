import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from 'harmony';

const playerData = new Map<string, tttGame>();

class tttGame {
	public turn: 'x' | 'o';
	public board: tttBoard = new tttBoard();
	constructor(public o: string, public x: string) {
		const selectedTurn = Math.floor(Math.random() * 2) + 1;
		selectedTurn === 0 ? (this.turn = 'x') : (this.turn = 'o');
	}
}

class tttSquare {
	public color: 'x' | 'o' | null = null;
	public disabled = false;
	constructor(public id: number){}
	getColor(): 'RED' | 'GREEN' | 'GREY' {
		return this.color ? (this.color === 'x' ? 'RED' : 'GREEN') : 'GREY'
	}
}

class tttBoard {
	public rows: tttData['row'] = [];
	constructor() {
		for (let i = 0; i < 3; i++) {
			const row = [];
			for (let x = 0; x < 3; x++) {
				row.push(new tttSquare(parseInt(`${i+1}${x+1}`)));
			}
			this.rows.push(row);
		}
	}
}

interface tttData {
	row: tttData['rowData'][];
	rowData: tttSquare[];
}

export class command extends Command {
	name = 'tictactoe';
	aliases = ['ttt'];
	usage = 'Tictactoe <user>';
	category = 'games';
	description = 'Play tictactoe with someone else';
	async execute(ctx: CommandContext) {
		if (playerData.has(ctx.author.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: 'Games',
					description:
						'You currently have a game open!',
				}).setColor('random'),
			});
			return;
		}
		const targetuser = ctx.message.mentions.users.array()[0];
		if (!targetuser) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: 'Games',
					description:
						'You need to mention a user to play with them!',
				}).setColor('random'),
			});
			return;
		} else {
			if (targetuser.bot || targetuser.id === ctx.author.id) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Games',
						description: `You can't play with ${
							targetuser.bot ? 'bots' : 'yourself'
						}!`,
					}).setColor('random'),
				});
				return;
			} else {
				playerData.set(ctx.author.id, new tttGame(ctx.author.id, targetuser.id));
				const now = Date.now();
				const message = await ctx.message.reply(targetuser.mention, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Games',
						description: `${ctx.author.username} is inviting you to a game of TicTacToe!`,
						footer: {
							text: 'This request will expire in 30 seconds!',
						},
					}).setColor('random'),
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									label: 'Accept',
									style: 'GREEN',
									customID: `accept-${now}`,
								},
								{
									type: 2,
									label: 'Deny',
									style: 'RED',
									customID: `deny-${now}`,
								},
							],
						},
					],
				});
				const reply = await ctx.client.waitFor(
					'interactionCreate',
					(i) =>
						isMessageComponentInteraction(i) &&
						i.customID.endsWith(`-${now}`) &&
						i.user.id === targetuser.id,
					30 * 1000
				);
				if (!reply[0]) {
					playerData.delete(ctx.author.id);
					message.edit(undefined, {
						embed: new Embed({
							author: {
								name: 'Bidome bot',
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: 'Games',
							description: `Invite expired!`,
						}).setColor('random'),
						components: [],
					});
					return;
				} else {
					if (!isMessageComponentInteraction(reply[0])) return;
					if (reply[0].customID.startsWith('deny')) {
						message.edit(undefined, {
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: 'Games',
								description: `${reply[0].user.username} denied the request!`,
							}).setColor('random'),
							components: [],
						});
						return;
					} else {
						const board = playerData.get(ctx.author.id)
						if (!board) return;
						message.edit(undefined, {
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: 'Games',
								description: `Turn: <@!${board[board.turn]}>`,
							}).setColor('random'),
							components: board?.board.rows.map((row)=>({
								type: 1,
								components: row.map((button)=>({
									type: 1,
									label: button.color ? button.color?.toUpperCase() : '?',
									disabled: button.disabled,
									cusomID: button.id,
									style: button.getColor()
								}))
							})),
						});
						return;
					}
				}
			}
		}
	}
}
