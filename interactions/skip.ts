import { MessageComponentInteraction, Embed } from "harmony";
import { TrackEndReason } from "https://deno.land/x/lavalink_types@2.0.6/mod.ts";
import { queues, doPermCheck } from "queue";

export default async function skip(i: MessageComponentInteraction) {
	if (i.customID == "skip-song") {
		if (!queues.has(i.guild!.id)) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
						title: "Not currently playing!",
						description: "I am not currently playing anything!",
					}).setColor("red"),
				],
			});
		} else {
			const queue = queues.get(i.guild!.id)!;
			const states = await i.guild!.voiceStates.get(i.user.id);
			const doesUserNeedToBeAdded = !queue.voteSkipUsers.includes(i.user.id);

			if (doesUserNeedToBeAdded) {
				queue.voteSkipUsers.push(i.user.id);
			}

			const canVoteSkip = queue.canSkip(
				(await states!.channel!.voiceStates.array()).filter((s) => !s.user.bot)
			);

			if (canVoteSkip) {
				const isSongLoop = !!queue.songLoop;
				const isQueueLoop = !!queue.queueLoop;

				queue.songLoop = false;
				queue.queueLoop = false;

				await queue.player.emit("trackEnd", queue.queue[0].track, TrackEndReason.Finished);

				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
							title: "Skipped",
							description:
								"Enough users have voted so the song has been skipped!",
						}).setColor("green"),
					],
				});

				// Reset the loop settings
				queue.songLoop = isSongLoop;
				queue.queueLoop = isQueueLoop;
			} else {
				const voiceMembers = (
					await states!.channel!.voiceStates.array()
				).filter((s) => !s.user.bot);
				const skippingUsers = [];

				for (const member of voiceMembers) {
					if (queue.voteSkipUsers.includes(member.user.id)) {
						skippingUsers.push(member.user.id);
					}
				}

				if (doesUserNeedToBeAdded) {
					await i.respond({
						ephemeral: true,
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
								title: "Voted to skip",
								description: `You have voted to skip the song! ${
									skippingUsers.length
								}/${Math.floor(voiceMembers.length / 2) + 1}`,
								footer: {
									text: (await doPermCheck(i.member!, states!.channel!))
										? "Use forceskip to skip without a vote"
										: "",
								},
							}).setColor("green"),
						],
					});
				} else {
					await i.respond({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
								title: "Already voted to skip",
								description: `You have already voted to skip the song! ${
									skippingUsers.length
								}/${Math.floor(voiceMembers.length / 2) + 1}`,
								footer: {
									text: (await doPermCheck(i.member!, states!.channel!))
										? "Use forceskip to skip without a vote"
										: "",
								},
							}).setColor("red"),
						],
					});
				}
			}
		}

		return false;
	}
}
