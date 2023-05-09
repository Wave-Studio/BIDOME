import {
	CommandClient,
	Embed,
	MessageComponentData,
	TextChannel,
} from "harmony";
import { getString, getUserLanguage } from "i18n";
import { toMs } from "tools";
import { supabase } from "supabase";
import { getReminders, removeReminder } from "settings";

export default function reminderClock(bot: CommandClient) {
	setInterval(async () => {
		if (Deno.env.get("IS_DEV") == "true") return;
		if (bot.gateway.connected) {
			for (const reminder of getReminders()) {
				const remind_at = new Date(reminder.remind_at);
				const now = Date.now();
				if (remind_at.valueOf() <= now) {
					const userLanguage = await getUserLanguage(
						reminder.user_id,
					);
					const user = await bot.users.get(reminder.user_id);
					const createdAt = (
						new Date(reminder.created_at).getTime() / 1000
					).toFixed(0);

					const reminderMessage = new Embed({
						author: {
							name: "Bidome bot",
							icon_url: bot.user!.avatarURL(),
						},
						title: getString(
							userLanguage,
							"interactions.reminder.notify.title",
							`#${reminder.id}`,
						),
						description: getString(
							userLanguage,
							"interactions.reminder.notify.description",
							`<t:${createdAt}:R>`,
							reminder.reminder,
						),
						url: `https://discord.com/channels/${reminder.server_id}/${reminder.channel_id}/${reminder.message_id}`,
					}).setColor("random");
					const components: MessageComponentData[] = [];

					if (
						reminder.future_sends != undefined &&
						reminder.future_sends.length > 0
					) {
						const possibleFutureSends = [];

						for (const futureSend of reminder.future_sends) {
							const futureDate =
								new Date(reminder.created_at).getTime() +
								toMs(futureSend);
							if (futureDate > now) {
								possibleFutureSends.push(futureSend);
							}
						}

						if (possibleFutureSends.length > 0) {
							await supabase
								.from("reminders")
								.update({
									remind_at: new Date(
										new Date(reminder.created_at)
											.getTime() +
											toMs(possibleFutureSends[0]),
									).toISOString(),
									future_sends: possibleFutureSends,
								})
								.eq("id", reminder.id);

							components.push({
								type: 1,
								components: [
									{
										type: 2,
										style: "RED",
										label: getString(
											userLanguage,
											"interactions.reminder.button.delete",
										),
										customID: `delrem_${reminder.id}`,
									},
								],
							});
						} else {
							removeReminder(reminder.id);
						}
					} else {
						removeReminder(reminder.id);
					}

					try {
						await user?.send({
							embeds: [reminderMessage],
							components,
						});
					} catch {
						try {
							const channel = (await bot.channels.get(
								reminder.channel_id,
							)) as TextChannel;
							await channel.send({
								content: `<@${reminder.user_id}>`,
								embeds: [reminderMessage],
								components,
							});
						} catch {
							// ignore
						}
					}
				}
			}
		}
	}, 5000);
}
