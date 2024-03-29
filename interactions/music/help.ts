import { Embed, MessageComponentInteraction } from "harmony";
import { getEmojiByName } from "emoji";

export async function button(i: MessageComponentInteraction) {
	if (i.customID == "help-song") {
		await i.respond({
			ephemeral: true,
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: i.client.user!.avatarURL(),
					},
					title: "Now Playing - Help",
					description: [
						`${getEmojiByName("question")} - Show this menu`,
						`${
							getEmojiByName("black_square_for_stop")
						} - Disconnect the player`,
						`${
							getEmojiByName("fast_forward")
						} - Vote to skip the current song`,
						`${
							getEmojiByName("twisted_rightwards_arrows")
						} - Shuffle the queue`,
						`${
							getEmojiByName("arrows_counterclockwise")
						} - Refresh the nowplaying embed`,
					].join("\n"),
				}).setColor("random"),
			],
		});
		return false;
	}
}
