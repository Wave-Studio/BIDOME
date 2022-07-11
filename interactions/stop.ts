import {
	MessageComponentInteraction,
	Embed,
	InteractionResponseType,
} from "harmony";
import { queues, doPermCheck } from "queue";

export default async function reloadMusicEmbed(i: MessageComponentInteraction) {
	if (i.customID == "stop-song") {
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
				queue.deleteQueue(true);
				await i.respond({
					type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
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
							title: "Unable to disconnect",
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
