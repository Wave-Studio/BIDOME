import {
	Extension,
	CommandContext,
	Embed,
	Gateway,
	command,
	CommandClient as CmdClient,
	MessageComponentData,
	isMessageComponentInteraction,
} from "harmony";
import { Cluster, UpdateVoiceStatus } from "lavadeno";
import { removeDiscordFormatting, formatMs, shuffleArray } from "tools";
import { Queue, Song } from "queue";

// Deno says to use let here instead of var so ok ig
let lavalink: Cluster;
const queue: Map<string, Queue> = new Map();

export class extension extends Extension {
	constructor(bot: CmdClient) {
		super(bot);

		const sendGatewayPayload = (id: bigint, payload: UpdateVoiceStatus) => {
			const shardID = Number(
				(BigInt(id) << 22n) % BigInt(this.client.shards.cachedShardCount ?? 1)
			);
			const shard = this.client.shards.get(shardID) as Gateway;
			// @ts-ignore stop errors
			shard.send(payload);
		};

		// Ty https://lavalink.darrennathanael.com/NoSSL/lavalink-without-ssl/
		lavalink = new Cluster({
			nodes: [
				{
					host: "usa.lavalink.mitask.tech",
					port: 2333,
					password: "lvserver",
					id: "1",
					reconnect: {
						type: "basic",
						tries: -1,
						delay: 5 * 1000,
					},
				},
			],
			sendGatewayPayload,
		});

		lavalink.on("nodeConnect", (node, took, reconnect) => {
			console.log(
				`[Lavalink]: Node ${
					node.id
				} Connected! Took: ${took}ms Auto-Reconnect: ${
					reconnect ? "Yes" : "No"
				}`
			);
		});

		lavalink.on("nodeError", (node, error) => {
			console.log(`[Lavalink]: Node ${node.id} had an error!\n`, error);
		});

		lavalink.on("nodeDisconnect", (node, code, reason) => {
			node.connect();
			console.log(
				`[Lavalink]: Node ${node.id} disconnected! Code: ${code} Reason: ${
					reason ?? "No reason given"
				}`
			);
		});

		this.client.on("raw", (evt: string, d: unknown) => {
			switch (evt) {
				case "VOICE_SERVER_UPDATE":
				case "VOICE_STATE_UPDATE":
					// @ts-expect-error Typings
					lavalink.handleVoiceUpdate(d);
			}
		});

		lavalink.init(BigInt(this.client.user?.id as string));
	}

	@command({
		aliases: ["summon"],
		category: "music",
		description: "Join the voice channel",
	})
	async join(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		const vc = await ctx.guild.voiceStates.get(ctx.author.id);

		if (!vc) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "Please join a music channel!",
				}).setColor("random"),
			});
		} else {
			if (
				queue.has(ctx.guild.id) &&
				queue.get(ctx.guild.id)?.player.connected
			) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am already connected to another channel!",
					}).setColor("random"),
				});
			} else {
				if (queue.has(ctx.guild.id)) {
					queue.get(ctx.guild.id)?.player.destroy();
				}

				const serverQueue = await new Queue(
					lavalink,
					vc.channel?.id as string,
					ctx.author.id,
					ctx.guild?.id as string,
					ctx.client,
					queue
				);
				serverQueue.deleteQueue();

				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: `Joined **${removeDiscordFormatting(
							vc.channel?.name as string
						)}**`,
					}).setColor("random"),
				});
			}
		}
	}

	@command({
		aliases: ["enqueue", "p"],
		category: "music",
		description: "Play a song",
	})
	async play(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "Please provide a search query!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);

			if (!vc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "Please join a music channel!",
					}).setColor("random"),
				});
			} else {
				if (
					queue.has(ctx.guild.id) &&
					queue.get(ctx.guild.id)?.channel != vc.channel?.id
				) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "I am currently playing in another channel!",
						}).setColor("random"),
					});
				} else {
					const message = await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "<a:typing:779775412829028373> Finding track",
						}).setColor("random"),
					});

					const isURL = /(((http|https):\/\/)|www.)/i.test(ctx.argString);

					const searchPrompt = isURL
						? ctx.argString
						: `ytsearch:${ctx.argString}`;

					const res = await lavalink.rest.loadTracks(searchPrompt),
						{ tracks } = res;

					//console.log(res);
					if (tracks.length < 1) {
						message.edit(
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "❗ Unable to find a track with that name",
							}).setColor("random")
						);
					} else {
						const getImageFromURI = (_uri: string): string | null => {
							return null;
						};

						const track = tracks[0].info;
						let song: Song = {
							requestedBy: ctx.author.id,
							name: track.title,
							author: track.author,
							image: getImageFromURI(track.uri),
							url: track.uri,
							msLength: track.length,
							track: tracks[0].track,
						};
						if (!isURL) {
							const now = Date.now();
							const buttons: MessageComponentData[] = [];
							let options = "";
							for (
								let i = 0;
								i < (tracks.length < 5 ? tracks.length : 5);
								i++
							) {
								const track = tracks[i];
								buttons.push({
									type: 2,
									label: `#${i + 1}`,
									customID: `${now}-${i}`,
									style: "BLURPLE",
								});
								options += `\n\`#${i + 1}\` - [${removeDiscordFormatting(
									track.info.title.length > 197
										? `${track.info.title.substring(
												0,
												track.info.title.length - 3
										  )}...`
										: track.info.title
								)}](${track.info.uri})`;
							}
							await message.edit({
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: options,
									footer: {
										text: "This will expire in 30 seconds!",
									},
								}).setColor("random"),
								components: [
									{
										type: 1,
										components: buttons,
									},
									{
										type: 1,
										components: [
											{
												type: 2,
												style: "RED",
												label: "Cancel",
												customID: `${now}-cancel`,
											},
										],
									},
								],
							});
							const [response] = await ctx.client.waitFor(
								"interactionCreate",
								(i) =>
									i.user.id == ctx.author.id &&
									isMessageComponentInteraction(i) &&
									i.customID.startsWith(`${now}-`),
								30 * 1000
							);
							if (!response) {
								message.edit({
									embed: new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user?.avatarURL(),
										},
										title: "Music",
										description: "Selection timed out",
									}).setColor("random"),
									components: [],
								});
								return;
							} else {
								if (!isMessageComponentInteraction(response)) return;
								if (response.customID == `${now}-cancel`) {
									message.edit({
										embed: new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user?.avatarURL(),
											},
											title: "Music",
											description: "Canceled selection",
										}).setColor("random"),
										components: [],
									});
									return;
								} else {
									const trackInfo =
										tracks[
											parseInt(response.customID.substring(`${now}-`.length))
										];
									const track = trackInfo.info;
									song = {
										requestedBy: ctx.author.id,
										name: track.title,
										author: track.author,
										image: getImageFromURI(track.uri),
										url: track.uri,
										msLength: track.length,
										track: trackInfo.track,
									};
								}
							}
						}
						if (
							!queue.has(ctx.guild.id) ||
							queue.get(ctx.guild.id)?.queue == undefined ||
							(queue.get(ctx.guild.id)?.queue.length as number) < 1
						) {
							queue.delete(ctx.guild.id);
							queue.set(
								ctx.guild.id,
								new Queue(
									lavalink,
									vc.channel?.id as string,
									ctx.author.id,
									ctx.guild.id,
									ctx.client,
									queue,
									message
								)
							);
						}
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						if (serverQueue.queue.length > 0) {
							message.edit({
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Added song to queue",
									fields: [
										{
											name: "Song",
											value: `\`${(song.name.length > 197
												? `${song.name.substring(0, 197)}...`
												: song.name
											)
												.replace(/`/gi, "\\`")
												.replace(/\\/, "\\")}\``,
											inline: true,
										},
										{
											name: "Author",
											value: `${removeDiscordFormatting(song.author)}`,
											inline: true,
										},
										{
											name: "Length",
											value: `${formatMs(song.msLength)}`,
											inline: true,
										},
										{
											name: "Position",
											value: `${serverQueue.queue.length + 1}`,
											inline: true,
										},
									],
									thumbnail: {
										url: song.image ?? undefined,
									},
								}).setColor("random"),
								components: [],
							});
						}
						serverQueue.addSong(song);
					}
				}
			}
		}
	}

	@command({
		aliases: ["q", "serverqueue"],
		category: "music",
		description: "See the current queue",
	})
	async queue(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const songs = (queue.get(ctx.guild.id) as Queue).queue;
			const info: { pos: number; song: Song }[] = [];
			for (let i = 0; i < (songs.length < 5 ? songs.length : 5); i++) {
				info.push({ pos: i, song: songs[i] });
			}
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Up next",
					description: info
						.map(
							({ pos, song }) =>
								`\`${pos == 0 ? "Now playing" : `#${pos + 1}`}\` - **${(song
									.name.length > 197
									? `${song.name.substring(0, 197)}...`
									: song.name
								)
									.replace(/`/gi, "\\`")
									.replace(/\\/, "\\")}** (${formatMs(song.msLength)})`
						)
						.join("\n"),
					footer: {
						text: `Total length: ${songs.length}`,
					},
				}).setColor("random"),
			});
		}
	}

	@command({
		aliases: ["np"],
		category: "music",
		description: "See what song is currently playing",
	})
	async nowplaying(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const serverQueue = queue.get(ctx.guild.id) as Queue;
			const song = serverQueue.queue[0];
			ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Playing song",
					fields: [
						{
							name: "Song",
							value: `\`${(song.name.length > 197
								? `${song.name.substring(0, 197)}...`
								: song.name
							)
								.replace(/`/gi, "\\`")
								.replace(/\\/, "\\")}\``,
							inline: true,
						},
						{
							name: "Author",
							value: `${removeDiscordFormatting(song.author)}`,
							inline: true,
						},
						{
							name: "Length",
							value: `${formatMs(song.msLength)}`,
							inline: true,
						},
						{
							name: "Requested by",
							value: `<@!${song.requestedBy}>`,
							inline: true,
						},
						{
							name: "Progress:",
							value: `\`${formatMs(
								(serverQueue.player.position ?? 1000) < 1000
									? 1000
									: serverQueue.player.position ?? 1000,
								true
							)}\`/\`${formatMs(song.msLength, true)}\``,
							inline: true,
						},
					],
					thumbnail: {
						url: song.image ?? undefined,
					},
				}).setColor("random"),
			});
		}
	}

	@command({
		aliases: ["dc", "fuckoff", "stop"],
		category: "music",
		description: "Disconnect the bot",
	})
	async disconnect(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						await serverQueue.player.destroy();
						serverQueue.deleteQueue();
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "I have stopped the player!",
							}).setColor("random"),
						});
						queue.delete(ctx.guild.id);
					}
				}
			}
		}
	}

	@command({
		aliases: ["s"],
		category: "music",
		description: "Vote to skip the current song",
	})
	async skip(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
					if (serverQueue.voteSkip.includes(ctx.author.id)) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "You have already voted to skip the song!",
							}).setColor("random"),
						});
					} else {
						const connectedUsers = (
							(await vc.channel?.voiceStates.array()) ?? []
						)
							.filter((d) => !d.user.bot)
							.map((d) => d.user.id);

						const message = await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "You have voted to skip the queue!",
							}).setColor("random"),
						});

						serverQueue.voteSkip.push(ctx.author.id);

						if (serverQueue.shouldBotVoteskip(connectedUsers)) {
							// Freeze variables
							const shouldEnableLoop = serverQueue.songloop ? true : false;

							serverQueue.songloop = false;

							if (serverQueue.songloop) {
								serverQueue.queue.shift();
							}
							serverQueue.onTrackEnd();
							await message.edit({
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description:
										"Vote skip requirement met! I have skipped the track!",
								}).setColor("random"),
							});

							if (serverQueue.queue.length > 0) {
								serverQueue.songloop = shouldEnableLoop;
							}
						}
					}
				}
			}
		}
	}

	@command({
		aliases: ["fs"],
		category: "music",
		description: "Force skip the current song",
	})
	async forceskip(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!(
							ctx.member?.permissions.has("ADMINISTRATOR") ||
							ctx.author.id == queue.get(ctx.guild.id)!.queue[0].requestedBy
						)
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						// Freeze variables
						const shouldEnableLoop = serverQueue.songloop ? true : false;

						serverQueue.songloop = false;

						if (serverQueue.songloop) {
							serverQueue.queue.shift();
						}

						serverQueue.onTrackEnd();
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "I have skipped the song!",
							}).setColor("random"),
						});

						if (serverQueue.queue.length > 0) {
							serverQueue.songloop = shouldEnableLoop;
						}
					}
				}
			}
		}
	}

	@command({
		category: "music",
		description: "Pause the music",
	})
	async pause(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						if (serverQueue.player.paused) {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: "The player is already paused!",
								}).setColor("random"),
							});
						} else {
							serverQueue.player.pause();
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: "I have paused the player!",
								}).setColor("random"),
							});
						}
					}
				}
			}
		}
	}

	@command({
		category: "music",
		description: "Resume the music",
	})
	async resume(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						if (!serverQueue.player.paused) {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: "The player is already resumed!",
								}).setColor("random"),
							});
						} else {
							serverQueue.player.resume();
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: "I have resumed the player!",
								}).setColor("random"),
							});
						}
					}
				}
			}
		}
	}

	@command({
		aliases: ["vol"],
		category: "music",
		description: "Change music volume",
	})
	async volume(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						if (ctx.argString == "") {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: "You need to provide a new volume!",
								}).setColor("random"),
							});
						} else {
							const number = parseInt(ctx.argString);
							if (isNaN(number)) {
								await ctx.message.reply(undefined, {
									embed: new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user?.avatarURL(),
										},
										title: "Music",
										description: "Invalid number provided!",
									}).setColor("random"),
								});
							} else {
								const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
								if (number < 1 || number > 1000) {
									await ctx.message.reply(undefined, {
										embed: new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user?.avatarURL(),
											},
											title: "Music",
											description: `You must provide a value between \`1-1000\``,
										}).setColor("random"),
									});
								} else {
									serverQueue.volume = number;
									serverQueue.player.setVolume(number);
									await ctx.message.reply(undefined, {
										embed: new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user?.avatarURL(),
											},
											title: "Music",
											description: `I have set the volume to \`${ctx.argString}\``,
											footer: {
												text:
													number > 100
														? "\nVolume above 100 may reduce the quality of the audio or cause hearing damage. Be cautious"
														: "",
											},
										}).setColor("random"),
									});
								}
							}
						}
					}
				}
			}
		}
	}

	@command({
		aliases: ["qloop", "ql"],
		category: "music",
		description: "Toggle loop on the queue",
	})
	async queueloop(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						if (serverQueue.songloop) {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description:
										"Song loop is currently enabled! Please disable it before enabing queue loop",
								}).setColor("random"),
							});
						} else {
							serverQueue.queueloop = !serverQueue.queueloop;
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: `Togged Queue loop ${
										serverQueue.queueloop ? "On" : "Off"
									}`,
								}).setColor("random"),
							});
						}
					}
				}
			}
		}
	}

	@command({
		aliases: ["songloop", "l", "sl"],
		category: "music",
		description: "Toggle loop on the current song",
	})
	async loop(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
						if (serverQueue.queueloop) {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description:
										"Queue loop is currently enabled! Please disable it before enabing regular loop",
								}).setColor("random"),
							});
						} else {
							serverQueue.songloop = !serverQueue.songloop;
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: `Togged Song loop ${
										serverQueue.songloop ? "On" : "Off"
									}`,
								}).setColor("random"),
							});
						}
					}
				}
			}
		}
	}

	@command({
		aliases: ["rm", "removesong"],
		category: "music",
		description: "Remove a specific song",
	})
	async remove(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (ctx.argString == "") {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "You need to provide a song position!",
							}).setColor("random"),
						});
					} else {
						const number = parseInt(ctx.argString);
						if (isNaN(number)) {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Music",
									description: "Invalid number provided!",
								}).setColor("random"),
							});
						} else {
							const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;
							if (number < 1 || number >= serverQueue.queue.length) {
								await ctx.message.reply(undefined, {
									embed: new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user?.avatarURL(),
										},
										title: "Music",
										description: `You must provide a value between \`${
											serverQueue.queue.length == 1
												? "0 Songs to remove"
												: `1-${serverQueue.queue.length - 1}`
										}\``,
									}).setColor("random"),
								});
							} else {
								if (
									((await vc.channel?.voiceStates.array()) ?? []).filter(
										(d) => !d.user.bot
									).length > 2 &&
									!ctx.member?.permissions.has("ADMINISTRATOR") &&
									serverQueue.queue[number].requestedBy != ctx.author.id
								) {
									await ctx.message.reply(undefined, {
										embed: new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user?.avatarURL(),
											},
											title: "Music",
											description:
												"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
										}).setColor("random"),
									});
								} else {
									const [removedSong] = serverQueue.queue.splice(number, 1);
									await ctx.message.reply(undefined, {
										embed: new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user?.avatarURL(),
											},
											title: "Music",
											description: `Removed \`${(removedSong.name.length > 197
												? `${removedSong.name.substring(0, 197)}...`
												: removedSong.name
											)
												.replace(/`/gi, "\\`")
												.replace(/\\/, "\\")}\` from queue!`,
										}).setColor("random"),
									});
								}
							}
						}
					}
				}
			}
		}
	}

	@command({
		aliases: ["mix"],
		category: "music",
		description: "Shuffle the music queue",
	})
	async shuffle(ctx: CommandContext) {
		if (!ctx.guild || !ctx.guild.id) return;
		if (!queue.has(ctx.guild.id)) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: "Music",
					description: "I am not currently playing anything!",
				}).setColor("random"),
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			const botvc = await ctx.guild.voiceStates.get(
				ctx.client.user?.id as string
			);
			if (!botvc) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Music",
						description: "I am not currently connected to a channel!",
					}).setColor("random"),
				});
			} else {
				if (!vc || botvc.channel?.id != vc.channel?.id) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Music",
							description: "You are not currently connected to my channel!",
						}).setColor("random"),
					});
				} else {
					if (
						((await vc.channel?.voiceStates.array()) ?? []).filter(
							(d) => !d.user.bot
						).length > 2 &&
						!ctx.member?.permissions.has("ADMINISTRATOR")
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description:
									"You are missing the permission `ADMINISTRATOR`! (Being alone also works)",
							}).setColor("random"),
						});
					} else {
						const serverQueue: Queue = queue.get(ctx.guild.id) as Queue;

						const newQueue = [...serverQueue.queue];
						newQueue.shift();

						shuffleArray(newQueue);

						const monkeyPatch = [serverQueue.queue[0]];

						for (const track of newQueue) {
							monkeyPatch.push(track);
						}

						serverQueue.queue = monkeyPatch;

						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Music",
								description: "I have shuffled the queue!",
							}).setColor("random"),
						});
					}
				}
			}
		}
	}
}
