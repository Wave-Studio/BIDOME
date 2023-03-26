import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, queues } from "queue";
import { formatMs, toMs } from "tools";
import { supabase } from "supabase";

export default class Seek extends Command {
	name = "seek";
	aliases = ["skipto"];
	category = "music";
	description = "Seek to a specific time in the song";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const queue = queues.get(ctx.guild.id);
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (
			queue == undefined || botState == undefined ||
			botState.channel == undefined
		) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Not currently playing!",
						description: "I am not currently playing anything!",
					}).setColor("red"),
				],
			});

			if (queue != undefined) {
				queue.deleteQueue();
			}
		} else {
			const queue = queues.get(ctx.guild!.id)!;
			if (await doPermCheck(ctx.member!, botState.channel)) {
				if (ctx.argString == "" || toMs(ctx.argString) < 0) {
					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Invalid argument",
								description:
									"Please provide a valid timestamp such as `4h` or `1d`",
							}).setColor("red"),
						],
					});
				} else {
					const position = toMs(ctx.argString);
					queue.player.seek(position);
					queue.player.position = position;

					if (queue.queueMessage != undefined) {
						queue.queueMessage.edit(queue.nowPlayingMessage);
					}

					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Changed player position",
								description:
									`The player's position has been moved to \`${
										formatMs(
											position,
										)
									}\``,
							}).setColor("green"),
						],
					});
					const song = queue.queue[0];

					// Even chatgpt can't figure out whats wrong.
					const calculatePlaybackTime = (msLength: number, position: number): string => {
						const startTime: number = new Date().getTime() - position;
						const playbackTime: Date = new Date(startTime + msLength);
						return playbackTime.toLocaleTimeString();
					  };
					  
					console.log(calculatePlaybackTime(position, song.msLength));

					// const newPlayedAtDate = calculatePlaybackTime(song.msLength, position);

					// const dbData = {
					// 	server_id: ctx.guild.id,
					// 	started: newPlayedAtDate,
					// 	name: song.title,
					// 	author: song.author,
					// 	thumbnail: song.thumbnail,
					// 	requestedby: song.requestedByString,
					// 	length: song.msLength,
					// };

					// await supabase.from("music_notifications").update(dbData)
					// 	.select("*").eq("server_id", ctx.guild.id);
				}
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to seek",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
