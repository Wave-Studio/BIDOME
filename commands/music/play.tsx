import {
	ActionRow,
	BotUI,
	Button,
	Command,
	CommandContext,
	Embed,
	fragment,
	isMessageComponentInteraction,
} from "harmony";
import { doPermCheck, nodes, queues, ServerQueue } from "queue";
import { Track, SearchResult } from "lavadeno";
import { emoji } from "emoji";
import { getRandomInteger, shuffleArray, sleep } from "tools";
import { getEmote } from "i18n";

const shuffleCommands = ["shuffleplay", "sp"];

export default class Play extends Command {
	override name = "play";
	override aliases = ["p", "enqueue", "add", ...shuffleCommands];
	override category = "music";
	override description = "Play a song";
	override usage = ["play <song query or URL>", "shuffleplay <playlist URL>", "play [attachment]"];

	override async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;

		if (ctx.argString == "") {
			if (ctx.message.attachments.length > 0) {
				const attachment = ctx.message.attachments[0];
				ctx.argString = attachment.url;
			}
		}

		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Missing arguments",
						description: "Please provide a song to play!",
					}).setColor("random"),
				],
			});
		} else {
			const botState = await ctx.guild!.voiceStates.get(
				ctx.client.user!.id,
			);
			if (
				queues.has(ctx.guild!.id) &&
				(botState == undefined || botState.channel == undefined)
			) {
				queues.get(ctx.guild!.id)!.deleteQueue();
			}

			const vc = await ctx.guild!.voiceStates.get(ctx.author.id);
			if (vc == undefined || vc.channel == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to play",
							description:
								"Please join a voice channel before playing!",
						}).setColor("red"),
					],
				});
			} else {
				const message = await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Searching for songs",
							description: `${getEmote("typing")} Searching`,
						}).setColor("random"),
					],
				});

				// Fix unicode breaking this
				if (
					// deno-lint-ignore no-control-regex
					!/^[\x00-\x7F\xA0-\xFF\u0400-\u04FF\u4E00-\u9FFF]*$/u.test(
						ctx.argString,
					)
				) {
					await sleep(getRandomInteger(1000, 2000));
					return await message.edit(undefined, {
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Unable to find songs!",
								description:
									"No songs were found for that result!",
							}).setColor("red"),
						],
					});
				}

				const isLink =
					/(https?:\/\/)?(www\.)?([a-zA-Z0-9][a-zA-Z0-9\-]{1,}[a-zA-Z0-9]\.?){1,}(\.[a-zA-Z]{2})?\.[a-zA-Z]{2,63}/i
						.test(
							ctx.argString,
						);

				const startsWithLavaSearch = /^((sc|ytm?)search):/i.test(
					ctx.argString,
				);

				const sourceMap = {
					"scsearch:": "soundcloud",
					"ytsearch:": "youtube",
					"ytmsearch:": "ytmusic",
					"bandcamp:": "bandcamp",
				};

				const [source, ...rest] = ctx.argString.split(":");

				const { loadType, tracks } = await nodes.search({
					query: startsWithLavaSearch
						? rest.join(":")
						: ctx.argString,
					requester: ctx.author.id,
					source: startsWithLavaSearch
						? sourceMap[source as keyof typeof sourceMap]
						: isLink
						? ctx.argString.includes("youtu")
							? "youtube"
							: undefined
						: "youtube",
				}) as SearchResult;

				if (loadType == "error" || loadType == "empty") {
					await message.edit(undefined, {
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Unable to find songs!",
								description:
									"No songs were found for that result!",
							}).setColor("red"),
						],
					});
				} else {
					let songsToAdd: Track[] = [];

					if (isLink) {
						switch (loadType) {
							case "playlist": {
								if (
									shuffleCommands.includes(
										ctx.message.content
											.substring(ctx.prefix.length)
											.trim()
											.split(" ")[0],
									)
								) {
									const tracks: Track[] = [];

									for (const track of tracks) {
										songsToAdd.push(track);
									}

									songsToAdd = shuffleArray(songsToAdd);
								} else {
									for (const track of tracks) {
										songsToAdd.push(track);
									}
								}
								break;
							}

							case "track": {
								songsToAdd.push(tracks[0]);
								break;
							}
						}
					} else {
						if (loadType != "search") {
							throw new Error("Invalid load type");
						}

						const now = Date.now();

						const emojiMap = {
							0: emoji("one"),
							1: emoji("two"),
							2: emoji("three"),
							3: emoji("four"),
							4: emoji("five"),
						};

						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Please select an option",
									description: tracks
										.slice(0, 5)
										.map(
											(track, i) =>
												`${
													emojiMap[
														i as 0 | 1 | 2 | 3 | 4
													]
												} - [${track.title}](${track.uri})`,
										)
										.join("\n"),
									footer: {
										text:
											"This message will time out in 30 seconds!",
									},
								}).setColor("red"),
							],
							components: (
								<>
									<ActionRow>
										{tracks.slice(0, 5).map((_, i) => (
											<Button
												style="blurple"
												emoji={{
													name: emojiMap[
														i as
															| 0
															| 1
															| 2
															| 3
															| 4
													],
												}}
												id={`${now}-${i.toString()}`}
											/>
										))}
									</ActionRow>
									<ActionRow>
										<Button
											style="red"
											label="Cancel"
											id={`${now}-cancel`}
										/>
									</ActionRow>
								</>
							),
						});

						const [response] = await ctx.client.waitFor(
							"interactionCreate",
							(i) =>
								isMessageComponentInteraction(i) &&
								i.user.id == ctx.author.id &&
								i.channel!.id == ctx.channel.id &&
								i.message.id == message.id,
							30 * 1000,
						);

						if (
							response == undefined ||
							!isMessageComponentInteraction(response) ||
							response.customID == `${now}-cancel`
						) {
							await message.edit(undefined, {
								embeds: [
									new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user!
												.avatarURL(),
										},
										title: "Selection canceled",
										description: "No songs were selected!",
									}).setColor("red"),
								],
								components: [],
							});
							return;
						} else {
							const [_, selected] = response.customID.split("-");
							const selectedTrack = tracks[parseInt(selected)];
							songsToAdd.push(selectedTrack);
						}
					}

					if (
						["916006382594064385", "725103887584985088"].includes(
							ctx.guild!.id,
						)
					) {
						const bannedSongIDs = ["vhpxylukBxo"];

						for (const song of songsToAdd) {
							if (song.uri == undefined) continue;
							const url = new URL(song.uri);
							const id = url.searchParams.get("v");
							if (id != null && bannedSongIDs.includes(id)) {
								await message.edit(undefined, {
									embeds: [
										new Embed({
											title: "no",
											description: "nice try",
										}).setColor("red"),
									],
									components: [],
								});
								return;
							}
						}
					}

					const isNewQueue = queues.has(ctx.guild.id);
					const queue: ServerQueue = isNewQueue
						? queues.get(ctx.guild.id)!
						: new ServerQueue(
							vc.channel.id,
							ctx.guild,
							vc.channel,
							ctx.channel,
							await doPermCheck(ctx.member!, vc.channel),
						);

					if (queue.player.voiceChannelId == undefined) {
						queue.player.setVoiceChannelId(vc.channel.id);
					}

					if (songsToAdd.length > 1) {
						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Enqueued songs",
									description:
										`Added ${songsToAdd.length} song${
											songsToAdd.length > 1 ? "s" : ""
										} to the queue!`,
									footer: {
										text: `Songs in queue: ${
											queue.player.queue.size + 1 +
											songsToAdd.length
										}`,
									},
								}).setColor("random"),
							],
							components: [],
						});
					} else {
						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Enqueued song",
									description: `Added [${
										songsToAdd[0].title
									}](${songsToAdd[0].uri}) to the queue!`,
									footer: {
										text: `Songs in queue: ${
											queue.player.queue.size + 1
										}`,
									},
								}).setColor("random"),
							],
							components: [],
						});
					}

					queue.addSongs(songsToAdd);
				}
			}
		}
	}
}
