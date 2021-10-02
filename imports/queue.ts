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
	constructor(
		private node: Cluster,
		public channel: string,
		public startedBy: string,
		public server: string,
		private client: CommandClient,
		private queueInstances: Map<string, Queue>,
		private message?: Message
	) {
		this.player =
			node.players.get(BigInt(server)) ??
			node.createPlayer(BigInt(server));
		this.player.connect(BigInt(channel), {
			deafen: true,
		});
		// TODO: Fix bot breaking on channel move
		let moved = false;
		this.player.on('channelMove', (_from, to) => {
			moved = true;
			this.channel = to.toString();
		});
		this.player.on('channelLeave', () => {
			this.deleteQueue();
		});

		const onTrackEnd = () => {
			setTimeout(() => {
				if (!moved) {
					this.queue.shift();
				} else {
					moved = false;
				}
				if (this.queue.length < 1) {
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
					this.player.destroy();
					this.queueInstances.delete(this.server);
					return;
				}
				this.playSong();
			}, 500);
		};

		this.player.on('trackEnd', onTrackEnd);
		this.player.on('trackStuck', onTrackEnd);
		this.player.on('trackException', onTrackEnd);
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
		this.player.stop();
		const song = this.queue[0];
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

	deleteQueue() {
		this.queue = [];
		this.player.stop();
		this.player.destroy();
		this.queueInstances.delete(this.server);
	}
}
