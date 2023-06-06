import { Embed, MessageComponentInteraction } from "harmony";
import { emoji } from "emoji";

export async function button(i: MessageComponentInteraction) {
	const options = ["scissors", "rock", "paper"];
	const emojis = [emoji("scissors"), emoji("rock"), emoji("page_facing_up")];
	const botChoice = options[Math.floor(Math.random() * options.length)];

	if (i.customID.startsWith("rps-")) {
		if (
			i.message.embeds[0]
				.footer!.icon_url!.split("/avatars/")[1]
				.split("/")[0] === i.user.id
		) {
			const userChoice = i.customID.substring("rps-".length);

			await i.message.edit({
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
						title: "RPS",
						fields: [
							{
								name: userChoice == botChoice
									? "It's a tie!"
									: (userChoice == "scissors" &&
											botChoice == "paper") ||
											(userChoice == "paper" &&
												botChoice == "rock") ||
											(userChoice == "rock" &&
												botChoice == "scissors")
									? "You win!"
									: "I win!",
								value: [
									`${emojis[options.indexOf(botChoice)]} <@!${
										i.client.user!.id
									}>`,
									`${
										emojis[options.indexOf(userChoice)]
									} <@!${i.user.id}>`,
								].join("\n"),
							},
						],
					}).setColor("random"),
				],
				components: [],
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
						title: "Unable to play!",
						description: "You are not the owner of this message.",
					}).setColor("red"),
				],
			});
		}

		return;
	}
}
