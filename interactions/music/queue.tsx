import {
	ActionRow,
	BotUI,
	Button,
	Embed,
	fragment,
	InteractionResponseType,
	MessageComponentInteraction,
} from "harmony";
import { getEmojiByName } from "emoji";
import { queues } from "queue";
import { formatMs, removeDiscordFormatting } from "tools";

export async function button(i: MessageComponentInteraction) {
	if (i.customID.startsWith("queuepg-")) {
		const pageOffset = parseInt(i.customID.split("-")[1]);
		const startingValue = pageOffset * 10;
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
			if (
				i.message.embeds[0]
					.footer!.icon_url!.split("/avatars/")[1]
					.split("/")[0] === i.user.id
			) {
				const queue = queues.get(i.guild!.id)!;

				const convertNumberToEmoji = (number: number) => {
					const emojiMap = [
						pageOffset < 1
							? getEmojiByName("arrow_forward")
							: getEmojiByName("zero"),
						getEmojiByName("one"),
						getEmojiByName("two"),
						getEmojiByName("three"),
						getEmojiByName("four"),
						getEmojiByName("five"),
						getEmojiByName("six"),
						getEmojiByName("seven"),
						getEmojiByName("eight"),
						getEmojiByName("nine"),
					];
					let str = "";

					for (const part of number.toString().split("")) {
						str += emojiMap[parseInt(part)];
					}
					return str;
				};

				await i.message.edit(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
							title: "Server queue",
							description: queue.queue
								.slice(startingValue, startingValue + 10)
								.map(
									({ title, url }, index) =>
										`${
											convertNumberToEmoji(
												parseInt(
													`${pageOffset}${index}`,
												),
											)
										} [${
											removeDiscordFormatting(title)
										}](${url})`,
								)
								.join("\n"),
							footer: {
								icon_url: i.user.avatarURL(),
								text:
									`Songs in queue: ${queue.queue.length} | Length: ${
										formatMs(queue.queueLength)
									}`,
							},
						}).setColor("random"),
					],
					components: (
						<>
							<ActionRow>
								<Button
									style={"blurple"}
									disabled={pageOffset < 1}
									id={pageOffset < 1
										? "queuepg-0"
										: `queuepg-${pageOffset - 1}`}
									emoji={{
										name: getEmojiByName("arrow_left"),
									}}
								/>
								<Button
									style={"blurple"}
									id={`queuepg-${pageOffset + 1}`}
									disabled={queue.queue.length <=
										startingValue + 10}
									emoji={{
										name: getEmojiByName("arrow_right"),
									}}
								/>
							</ActionRow>
						</>
					),
				});
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
							title: "Unable to show page!",
							description: "This is not your queue message!",
						}).setColor("red"),
					],
				});
			}
		}

		return false;
	}
}
