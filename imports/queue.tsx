import {
	CommandClient,
	Gateway,
	Guild,
	Message,
	Embed,
	AllMessageOptions,
	fragment,
	ActionRow,
	BotUI,
	Button,
	Member,
	VoiceChannel,
	VoiceState
} from "./harmony.ts";
import { Cluster, Player, PlayerEvents } from "./lavadeno.ts";
import { formatMs, removeDiscordFormatting } from "./tools.ts";
import { nodes } from "./nodes.ts";
import { getEmojiByName } from "./emoji.ts";

let client: CommandClient;

export const queues: Map<string, ServerQueue> = new Map();

export let lavaCluster: Cluster;

export const doPermCheck = async (user: Member, channel: VoiceChannel) => {
	// We do a bit of trolling
	if (client.owners.includes(user.id)) return true;
	if (
		((await channel.voiceStates.array()) ?? []).filter((u) => !u.user.bot)
			.length < 2
	)
		return true;
	if (user.permissions.has("ADMINISTRATOR")) return true;
	if (channel.guild.ownerID === user.id) return true;
	return false;
};

export class ServerQueue {
	public readonly player: Player;
	public readonly guildId: string;
	public voteSkipUsers: string[] = [];
	public queue: Song[] = [];
	public volume = 100;
	public songLoop = false;
	public queueLoop = false;
	private firstSong = true;

	constructor(
		public channel: string,
		private guild: Guild,
		public queueMessage?: Message
	) {
		this.guildId = this.guild.id;
		const playerExsists =
			lavaCluster.players.get(BigInt(this.guildId)) != undefined;
		this.player =
			lavaCluster.players.get(BigInt(this.guildId)) ??
			lavaCluster.createPlayer(BigInt(this.guildId));
		this.player.connect(BigInt(this.channel), {
			deafen: true,
		});

		if (!playerExsists) {
			this.player.on("trackStart", async () => {
				this.voteSkipUsers = [];
				
				if (this.queueMessage != undefined) {
					if (this.firstSong) {
						this.firstSong = false;
					} else {
						await this.queueMessage.edit(this.nowPlayingMessage);
					}
				}
			});

			this.player.on("channelMove", (_, to) => {
				this.channel = to.toString();
			});

			this.player.on("channelLeave", () => {
				this.deleteQueue();
			});

			for (const errorEvent of [
				"trackException",
				"trackStuck",
			] as (keyof PlayerEvents)[]) {
				this.player.on(errorEvent, () => {
					const song = this.queue.shift()!;

					if (this.queueMessage != undefined) {
						this.queueMessage.reply(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: client.user!.avatarURL(),
									},
									title: "Song removed",
									description: `An error occured while playing [${removeDiscordFormatting(
										song.title
									)}](${song.url}) so it has been removed from the queue!`,
								}).setColor("random"),
							],
						});
					}

					if (this.queue.length > 0) {
						this.play();
					} else {
						this.deleteQueue();
					}
				});
			}

			this.player.on("trackEnd", () => {
				if (!this.songLoop) {
					const finishedSong = this.queue.shift()!;
					if (this.queueLoop) {
						this.queue.push(finishedSong);
					}
				}

				if (this.queue.length > 0) {
					this.play();
				} else {
					this.deleteQueue();
				}
			});
		} else {
			// Prevent issues with playing
			this.player.disconnect();
		}

		queues.set(this.guildId, this);
	}

	public async deleteQueue(admin = false) {
		if (this.queueMessage != undefined) {
			await this.queueMessage.edit({
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: client.user!.avatarURL(),
						},
						title: "Finished queue",
						description: admin
							? "I have stopped the player"
							: "I have finished playing this queue",
					}).setColor("random"),
				],
				components: [],
			});
		}
		queues.delete(this.guildId);
		for (const key of [
			"trackStart",
			"trackEnd",
			"trackException",
			"trackStuck",
			"disconnected",
			"channelJoin",
			"channelLeave",
			"channelMove",
		] as (keyof PlayerEvents)[]) {
			this.player.off(key);
		}
		this.player.position = 0;
		this.player.stop();
		this.player.disconnect();
		this.player.destroy();
	}

	public addSongs(song: Song | Song[]) {
		const shouldPlay = this.queue.length < 1;
		if (Array.isArray(song)) {
			this.queue.push(...song);
		} else {
			this.queue.push(song);
		}

		if (shouldPlay) {
			this.play();
		}
	}

	public canSkip(voiceMembers: VoiceState[]) {
		const skippingUsers = [];

		for (const member of voiceMembers) {
			if (this.voteSkipUsers.includes(member.user.id)) {
				skippingUsers.push(member.user.id);
			}
		}

		return voiceMembers.length < 2 || skippingUsers.length >= Math.floor(voiceMembers.length / 2) + 1;
	}

	private async play() {
		if (this.queue.length < 1) return this.deleteQueue();
		this.voteSkipUsers = [];
		await this.player.stop();
		this.player.position = 0;
		await this.player.seek(0);

		const track = this.queue[0];

		await this.player.play(track.track, {
			volume: this.volume,
		});
	}

	public get queueLength() {
		let queueLength = 0;

		for (const { msLength } of this.queue) {
			queueLength += msLength;
		}

		return queueLength;
	}

	public get nowPlayingMessage(): AllMessageOptions {
		const song = this.queue[0];

		return {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: client.user!.avatarURL(),
					},
					title: "Now Playing",
					fields: [
						{
							name: "Song",
							value: `[${removeDiscordFormatting(song.title)}](${song.url})`,
							inline: true,
						},
						{
							name: "Author",
							value: song.author,
							inline: true,
						},
						{
							name: "Length",
							value: formatMs(song.msLength),
							inline: true,
						},

						{
							name: "Requested by",
							value: `<@!${song.requestedBy}>`,
							inline: true,
						},
						{
							name: "Progress",
							value: `${formatMs(
								(this.player.position ?? 0) < 1000
									? 1000
									: this.player.position!
							)}/${formatMs(song.msLength)}`,
							inline: true,
						},
						{
							name: "Loop Status",
							value:
								!this.queueLoop && !this.songLoop
									? "Disabled"
									: this.queueLoop
									? "Queue Loop"
									: "Song Loop",
							inline: true,
						},
					],
					thumbnail: {
						url: song.thumbnail,
					},
					footer: {
						text: `Songs in queue: ${this.queue.length} | Length: ${formatMs(
							this.queueLength
						)}`,
					},
				}).setColor("random"),
			],
			components: (
				<>
					<ActionRow>
						<Button
							style={"red"}
							emoji={{ name: getEmojiByName("black_square_for_stop") }}
							id={"stop-song"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("fast_forward") }}
							id={"skip-song"}
						/>
						<Button
							style={"green"}
							emoji={{ name: getEmojiByName("twisted_rightwards_arrows") }}
							id={"shuffle-songs"}
						/>
						<Button
							style={"grey"}
							emoji={{ name: getEmojiByName("arrows_counterclockwise") }}
							id={"refresh-songs"}
						/>
					</ActionRow>
				</>
			),
		};
	}
}

export interface Song {
	title: string;
	author: string;
	url: string;
	msLength: number;
	track: string;
	requestedBy: string;
	thumbnail?: string;
}

export const initLava = (bot: CommandClient) => {
	client = bot;

	const cluster = new Cluster({
		nodes,
		userId: BigInt(bot.user!.id),
		sendGatewayPayload: (id, payload) => {
			const shardID = Number(
				(BigInt(id) << 22n) % BigInt(bot.shards.cachedShardCount ?? 1)
			);
			const shard = bot.shards.get(shardID) as Gateway;
			shard.send(payload);
		},
	});
	lavaCluster = cluster;

	cluster.on("nodeConnect", (node, took, reconnect) => {
		console.log(
			`[Lavalink] Connected to node ${node.id} in ${formatMs(
				took,
				true
			).toLowerCase()} Reconnected: ${reconnect ? "Yes" : "No"}`
		);
	});

	cluster.on("nodeDisconnect", (node, code, reason, reconnecting) => {
		console.log(
			`[Lavalink] Disconnected from node ${
				node.id
			} with code: ${code} | ${reason} Reconnecting: ${
				reconnecting ? "Yes" : "No"
			}`
		);
	});

	cluster.on("nodeError", (node, error) => {
		console.log(`[Lavalink] Error on node ${node.id}:`, error);
	});

	bot.on("raw", (event, payload) => {
		switch (event) {
			case "VOICE_STATE_UPDATE":
			case "VOICE_SERVER_UPDATE": {
				cluster.handleVoiceUpdate(payload);
			}
		}
	});

	cluster.init(BigInt(bot.user!.id));
};
