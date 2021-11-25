import { Player, Cluster } from 'lavadeno';
import { Message, CommandClient, Embed } from 'harmony';
import { formatMs, removeDiscordFormatting } from 'tools';

export interface Song {
	name: string;
	image: string | null;
	requestedBy: string;
	url: string;
	msLength: number;
	track: string;
	author: string;
}

export class Queue {
	public player: Player;
	public queue: Song[] = [];
	public voteSkip: string[] = [];
	public volume = 100;
	public queueloop = false;
	public songloop = false;

	private instance: Queue = this;

	constructor(
		private node: Cluster,
		public channel: string,
		public startedBy: string,
		public server: string,
		private client: CommandClient,
		private queueInstances: Map<string, Queue>,
		private message?: Message
	) {
		this.voteSkip = [this.client.user?.id as string];

		this.player =
			node.players.get(BigInt(server)) ?? node.createPlayer(BigInt(server));
		this.player.connect(BigInt(channel), {
			deafen: true,
		});
		this.player.on('channelMove', (_from, _to) => {
			// Bug with lavadeno
			this.deleteQueue();
		});
		this.player.on('channelLeave', () => {
			this.deleteQueue();
		});

		this.player.on('trackEnd', () => this.onTrackEnd.call(this.instance));
		this.player.on('trackStuck', () => this.onTrackEnd.call(this.instance));
		this.player.on('trackException', () => this.onTrackEnd.call(this.instance));
	}

	onTrackEnd() {
		this.voteSkip = [this.client.user?.id as string];
		// Fix bugs somehow? idk
		if (this.queueloop) {
			this.queue.push(this.queue[0]);
			this.queue.shift();
		} else {
			if (!this.songloop) {
				this.queue.shift();
			}
		}

		if (this.queue.length < 1) {
			this.queueloop = false;
			this.songloop = false;
			if (this.message) {
				this.message.edit(
					new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: this.client.user?.avatarURL(),
						},
						title: 'Music',
						description: `I have finished my queue!`,
					}).setColor('random')
				);
			}
			this.deleteQueue();
			return;
		}
		this.playSong();
	}

	addSong(song: Song) {
		// Yes, I could call the queue push once for both thingys
		// Will i? No
		if (this.queue.length < 1) {
			this.queue.push(song);
			this.playSong();
		} else {
			this.queue.push(song);
		}
	}

	private playSong() {
		this.voteSkip = [this.client.user?.id as string];
		const song = this.queue[0];
		if (song == undefined) {
			this.deleteQueue();
		} else {
			if (this.message) {
				this.message.edit({
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: this.client.user?.avatarURL(),
						},
						title: 'Playing song',
						fields: [
							{
								name: 'Song',
								value: `\`${(song.name.length > 197
									? `${song.name.substring(0, 197)}...`
									: song.name
								)
									.replace(/`/gi, '\\`')
									.replace(/\\/, '\\')}\``,
								inline: true,
							},
							{
								name: 'Author',
								value: `${removeDiscordFormatting(song.author)}`,
								inline: true,
							},
							{
								name: 'Length',
								value: `${formatMs(song.msLength)}`,
								inline: true,
							},
							{
								name: 'Requested by',
								value: `<@!${song.requestedBy}>`,
								inline: true,
							},
							{
								name: 'Progress:',
								value: `\`${formatMs(
									(this.player.position ?? 1000) < 1000
										? 1000
										: this.player.position ?? 1000, true
								)}\`/\`${formatMs(song.msLength, true)}\``,
								inline: true,
							},
						],
						thumbnail: {
							url: song.image ?? undefined,
						},
					}).setColor('random'),
					components: [],
				});
			}
			this.player.play(song.track, {
				volume: this.volume,
			});
		}
	}

	async deleteQueue() {
		this.queue = [];
		await this.player.destroy();
		this.queueInstances.delete(this.server);
	}

	shouldBotVoteskip(users: string[]): boolean {
		const voteSkipUsers: string[] = [];
		for (const user of users) {
			if (this.voteSkip.includes(user)) {
				voteSkipUsers.push(user);
			}
		}
		const neededToSkip =
			users.length == 1
				? 0
				: Math.floor(users.length / 2) + 1;
		if (voteSkipUsers.length >= neededToSkip) return true;
		else return false;
	}
}