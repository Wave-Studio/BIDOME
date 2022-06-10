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
import { lavaCluster, queues, ServerQueue, Song } from "queue";
import { LoadType, Track } from "lavadeno";
import { getEmojiByName } from "emoji";
import { removeDiscordFormatting } from "tools";

export default class Play extends Command {
	name = "play";
	aliases = ["p", "enqueue", "add"]
	category = "music";
	description = "Play a song";
	usage = "play <song query or URL>";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: "Missing arguments",
						description: "Please provide a song to play!",
					}).setColor("random"),
				],
			});
		} else {
			const vc = await ctx.guild.voiceStates.get(ctx.author.id);
			if (vc == undefined || vc.channel == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Unable to play",
							description: "Please join a voice channel before playing!",
						}).setColor("red"),
					],
				});
			} else {
				const message = await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							title: "Searching for songs",
							description: "<a:typing:779775412829028373> Searching",
						}).setColor("random"),
					],
				});

				const isLink =
					/(https?:\/\/)?(www\.)?([a-zA-Z0-9][a-zA-Z0-9\-]{1,}[a-zA-Z0-9]\.?){1,}(\.[a-zA-Z]{2})?\.[a-zA-Z]{2,63}/i.test(
						ctx.argString
					);
				const { tracks, playlistInfo, loadType } =
					await lavaCluster.rest.loadTracks(
						isLink || /(yt|sc)search\:/i.test(ctx.argString)
							? ctx.argString
							: `ytsearch:${ctx.argString}`
					);

				if (
					tracks.length == 0 ||
					loadType == LoadType.LoadFailed ||
					loadType == LoadType.NoMatches
				) {
					await message.edit(undefined, {
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								title: "Unable to find songs!",
								description: "No songs were found for that result!",
							}).setColor("red"),
						],
					});
				} else {
					const songsToAdd: Song[] = [];

					const addTrackData = (trackInfo: Track) => {
						const {
							info: { title, author, uri, length },
							track,
						} = trackInfo;
						songsToAdd.push({
							title,
							author,
							url: uri,
							msLength: length,
							track,
							requestedBy: ctx.author.id,
						});
					};

					if (isLink) {
						if (loadType == LoadType.PlaylistLoaded) {
							for (const track of tracks) {
								addTrackData(track);
							}
						} else {
							addTrackData(tracks[0]);
						}
					} else {
						const now = Date.now();

						const emojiMap = {
							0: await getEmojiByName("one"),
							1: await getEmojiByName("two"),
							2: await getEmojiByName("three"),
							3: await getEmojiByName("four"),
							4: await getEmojiByName("five"),
						};

						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Please select an option",
									description: tracks
										.slice(0, 5)
										.map(
											(track, i) =>
												`${
													emojiMap[i as 0 | 1 | 2 | 3 | 4]
												} - [${removeDiscordFormatting(track.info.title)}](${track.info.uri})`
										)
										.join("\n"),
									footer: {
										text: "This message will time out in 30 seconds!",
									},
								}).setColor("red"),
							],
							components: (
								<>
									<ActionRow>
										{tracks.slice(0, 5).map((_, i) => (
											<Button
												style={"blurple"}
												emoji={{
													name: emojiMap[i as 0 | 1 | 2 | 3 | 4],
												}}
												id={`${now}-${i.toString()}`}
											/>
										))}
									</ActionRow>
									<ActionRow>
										<Button
											style={"red"}
											label={"Cancel"}
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
								i.channel!.id == ctx.channel.id && i.message.id == message.id,
							30 * 1000
						);

						if (response == undefined || !isMessageComponentInteraction(response) || response.customID == `${now}-cancel`) {
							await message.edit(undefined, {
								embeds: [
									new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user?.avatarURL(),
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
							addTrackData(selectedTrack);
						}
					}

					const isNewQueue = queues.has(ctx.guild.id);
					const queue: ServerQueue = isNewQueue
						? queues.get(ctx.guild.id)!
						: new ServerQueue(vc.channel.id, ctx.guild);

					if (songsToAdd.length > 1) {
						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Enqueued songs",
									description: `${songsToAdd.length} song${
										songsToAdd.length > 1 ? "s" : ""
									} enqueued!`,
									footer: {
										text: `Songs in queue: ${queue.queue.length + songsToAdd.length}`,
									}
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
										icon_url: ctx.client.user?.avatarURL(),
									},
									title: "Enqueued song",
									description: `Added [${removeDiscordFormatting(songsToAdd[0].title)}](${songsToAdd[0].url}) to the queue!`,
									footer: {
										text: `Songs in queue: ${queue.queue.length + 1}`,
									}
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
