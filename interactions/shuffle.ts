import {
	MessageComponentInteraction,
	Embed,
} from "harmony";
import { shuffleArray } from "tools";
import { queues, doPermCheck } from "queue";

export default async function reloadMusicEmbed(i: MessageComponentInteraction) {
	if (i.customID == "shuffle-songs") {
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

			await i.message.delete();
		} else {
			const queue = queues.get(i.guild!.id)!;
			const states = await i.guild!.voiceStates.get(i.user.id);
			if (await doPermCheck(i.member!, states!.channel!)) {
				const nowPlaying = queue.queue[0];
				const toMixSongs = queue.queue.slice(1);

				queue.queue = [nowPlaying, ...shuffleArray(toMixSongs)];

				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
							title: "Shuffled queue!",
							description: "I have shuffled the queue!",
						}).setColor("green"),
					],
				});
			} else {
				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
							title: "Unable to shuffle!",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}

		return false;
	}
}
