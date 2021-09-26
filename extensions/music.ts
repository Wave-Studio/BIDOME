import {
	Extension,
	CommandContext,
	Embed,
	Gateway,
	command,
	CommandClient as CmdClient,
} from 'harmony';
import { GuildQueue } from 'types/music';
import { Cluster, UpdateVoiceStatus } from 'lavadeno';
import { removeDiscordFormatting } from 'tools';

var lavalink: Cluster;
const queue: Map<string, GuildQueue> = new Map();

export class extension extends Extension {
	constructor(bot: CmdClient) {
		super(bot);

		const sendGatewayPayload = (id: bigint, payload: UpdateVoiceStatus) => {
			const shardID = Number(
				(BigInt(id) << 22n) %
					BigInt(this.client.shards.cachedShardCount ?? 1)
			);
			const shard = this.client.shards.get(shardID) as Gateway;
			// @ts-ignore stop errors
			shard.send(payload);
		};

		lavalink = new Cluster({
			nodes: [
				{
					host: '127.0.0.1',
					port: 2333,
					password: 'youshallnotpass',
					id: '1',
					reconnect: {
						type: 'basic',
						tries: -1,
						delay: 5 * 1000,
					},
				},
			],
			sendGatewayPayload,
		});

		lavalink.on('nodeConnect', (node, took, reconnect) => {
			console.log(
				`[Lavalink]: Node ${
					node.id
				} Connected! Took: ${took}ms Auto-Reconnect: ${
					reconnect ? 'Yes' : 'No'
				}`
			);
		});

		lavalink.on('nodeError', (node, error) => {
			console.log(`[Lavalink]: Node ${node.id} had an error!\n`, error);
		});

		lavalink.on('nodeDisconnect', (node, code, reason) => {
			console.log(
				`[Lavalink]: Node ${
					node.id
				} disconnected! Code: ${code} Reason: ${
					reason ?? 'No reason given'
				}`
			);
		});

		this.client.on('raw', (evt: string, d: unknown) => {
			switch (evt) {
				case 'VOICE_SERVER_UPDATE':
				case 'VOICE_STATE_UPDATE':
					// @ts-expect-error Typings
					lavalink.handleVoiceUpdate(d);
			}
		});

		lavalink.init(BigInt(this.client.user?.id as string));
	}

	@command({
		aliases: ['summon'],
	})
	async join(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;

		const vc = await ctx.guild.voiceStates.get(ctx.author.id);
		if (!vc) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: 'Music',
					description: 'Please join a music channel!',
				}).setColor('random'),
			});
		} else {
			const player =
				lavalink.players.get(BigInt(ctx.guild.id)) ??
				lavalink.createPlayer(BigInt(ctx.guild.id));
			if (player.connected && queue.has(ctx.guild.id)) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Music',
						description:
							'I am already connected to another channel!',
					}).setColor('random'),
				});
			} else {
				player.connect(BigInt(vc.channel?.id as string), {
					deafen: true,
				});

				player.on('channelLeave', () => {
					player.destroy();
					queue.delete(ctx.guild?.id as string);
				});

				queue.set(ctx.guild.id, {
					channel: vc.channel?.id as string,
					songs: [],
					connection: player,
					startedby: ctx.author.id,
					voteskip: [],
					message: null,
				});

				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Music',
						description: `Joined **${removeDiscordFormatting(
							vc.channel?.name as string
						)}**`,
					}).setColor('random'),
				});
			}
		}
	}
	@command({
		aliases: ['p'],
	})
	async play(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;

		if (ctx.argString == '') {
			ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: 'Music',
					description: 'Please provide a search query!',
				}).setColor('random'),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			if (!vc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Music',
						description: 'Please join a music channel!',
					}).setColor('random'),
				});
			} else {
				const player =
					lavalink.players.get(BigInt(ctx.guild.id)) ??
					lavalink.createPlayer(BigInt(ctx.guild.id));
				if (!player.connected) {
					player.connect(BigInt(vc.channel?.id as string), {
						deafen: true,
					});

					queue.set(ctx.guild.id, {
						channel: vc.channel?.id as string,
						songs: [],
						connection: player,
						startedby: ctx.author.id,
						voteskip: [],
						message: null,
					});
				}
				const playerInstance: GuildQueue = queue.get(
					ctx.guild.id
				) as GuildQueue;
				const { connection, songs, message } = playerInstance;
				const shiftQueue = () => {
					songs.shift();
					if (songs.length < 1) {
						connection.destroy();
						if (message != undefined) {
							message.edit(
								new Embed({
									author: {
										name: 'Bidome bot',
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: 'Music',
									description: 'Finished playing the queue!',
								}).setColor('random')
							);
						}
						queue.delete(ctx.guild?.id as string);
					} else {
						player.stop();
						player.play(songs[0].track);
					}
				};
				if (songs.length < 1) {
					connection.on('trackEnd', shiftQueue);
					connection.on('trackStuck', shiftQueue);
					connection.on('trackException', shiftQueue);
					connection.on('channelMove', (_from, to) => {
						playerInstance.channel = to.toString();
						player.stop();
						player.play(songs[0].track);
					});
				} else {
					const isUrl = /(?:(http|https):\/\/)?(?:www.)?/i.test(
						ctx.argString
					);

					let searchQuery = isUrl
						? ctx.argString
						: `ytsearch:${ctx.argString}`;

					if (!isUrl) {
					}

					const foundTracks = await lavalink.rest.loadTracks(
						searchQuery
					);
					const track = foundTracks.tracks[0];

					if (track == undefined) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: 'Music',
								description: 'Unable to find that song!',
							}).setColor('random'),
						});
					} else {
						songs.push({
							secondLength: track.info.length,
							name: track.info.title,
							requestedBy: ctx.author.username,
							url: track.info.uri,
							track: track.track,
							// TODO: Implement
							image: /(?:(http|https):\/\/)?(?:www\.)(youtube.com|youtu.be)?/i.test(
								track.info.uri
							)
								? null
								: null,
						});
					}
				}
			}
		}
	}
}
