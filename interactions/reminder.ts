import {
	MessageComponentInteraction,
	Embed,
} from "harmony";
import { getReminders } from "supabase";
import { createEmbedFromLangData, getUserLanguage, getString } from "i18n";
import { removeReminder } from "supabase";

export default async function reminder(i: MessageComponentInteraction) {
	if (i.customID.startsWith("delrem_")) {
		const lang = await getUserLanguage(i.user.id);
		const reminderID = i.customID.substring("delrem_".length);
		const reminder = getReminders().filter((r) => r.id == reminderID)[0];

		if (reminder != undefined) {
			if (reminder.user_id != i.user.id) {
				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"interactions.reminder.notyours"
							),
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}).setColor("red"),
					],
				});
			} else {
				await removeReminder(parseInt(reminderID));
				await i.message.edit({
					...i.message,
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									style: "RED",
									label: getString(lang, "interactions.reminder.button.delete"),
									customID: `disabled`,
									disabled: true,
								},
							],
						},
					],
				});
				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							...createEmbedFromLangData(lang, "interactions.reminder.deleted"),
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}).setColor("green"),
					],
				});
			}
		} else {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(lang, "interactions.reminder.invalidid"),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}).setColor("red"),
				],
			});
		}

		return false;
	}
}