import { CommandClient, Gateway, Guild, Message } from "./harmony.ts";
import { Cluster, Player, PlayerEvents } from "./lavadeno.ts";
import { formatMs } from "./tools.ts";
import { nodes } from "./nodes.ts";

// deno-lint-ignore no-unused-vars
let client: CommandClient;

export const queues: Map<string, ServerQueue> = new Map();

export let lavaCluster: Cluster;

export class ServerQueue {
	public player: Player;
	public readonly guildId: string;
	public queue: Song[] = [];
	public volume = 100;

	constructor(
		private channel: string,
		private guild: Guild,
		public queueMessage?: Message,
	) {
		this.guildId = this.guild.id;
		this.player = lavaCluster.players.get(BigInt(this.channel)) ??
			lavaCluster.createPlayer(BigInt(this.channel));
		this.player.connect(BigInt(this.channel), {
			deafen: true,
		});

		this.player.on("trackStart", (_track) => {

		});

		this.player.on("channelMove", (_, to) => {
			this.channel = to.toString();
			this.player.connect(BigInt(this.channel), {
				deafen: true,
			});
	
		})

		queues.set(this.guildId, this);
	}

	deleteQueue() {
		queues.delete(this.guildId);
		for (
			const key of [
				"trackStart",
				"trackEnd",
				"trackException",
				"trackStuck",
				"disconnected",
				"channelJoin",
				"channelLeave",
				"channelMove",
			] as (keyof PlayerEvents)[]
		) {
			this.player.off(key);
		}
		this.player.destroy();
	}

	addSongs(song: Song | Song[]) {
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

	private play() {
		// TODO: Make this proper or smth
		if (this.queue.length < 1) return;

		const track = this.queue[0];
		this.player.connect(BigInt(this.channel), {
			deafen: true,
		});
		this.player.play(track.track, {
			volume: this.volume,
		});
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
				(BigInt(id) << 22n) % BigInt(bot.shards.cachedShardCount ?? 1),
			);
			const shard = bot.shards.get(shardID) as Gateway;
			shard.send(payload);
		},
	});
	lavaCluster = cluster;

	cluster.on("nodeConnect", (node, took, reconnect) => {
		console.log(
			`[Lavalink] Connected to node ${node.id} in ${
				formatMs(
					took,
				)
			} Reconnected: ${reconnect ? "Yes" : "No"}`,
		);
	});

	cluster.on("nodeDisconnect", (node, code, reason, reconnecting) => {
		console.log(
			`[Lavalink] Disconnected from node ${node.id} with code: ${code} | ${reason} Reconnecting: ${
				reconnecting ? "Yes" : "No"
			}`,
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
