import {
	MessageComponentInteraction,
	Embed,
	InteractionResponseType,
} from "harmony";
import { queues } from "queue";

export default async function reloadMusicEmbed(i: MessageComponentInteraction) {
	if (i.customID == "refresh-songs") {
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
			await i.message.edit(queue.nowPlayingMessage);
			await i.respond({
				type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
			});
		}

		return false;
	}
}
