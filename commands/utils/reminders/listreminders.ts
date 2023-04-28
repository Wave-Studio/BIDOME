import { Command, CommandContext, Embed } from "harmony";
import { getReminders } from "supabase";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";

export default class ListReminders extends Command {
	name = "listreminders";
	aliases = ["reminders"];
	category = "utils";
	description = "List your reminders";

	async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author);
		const reminders = await getReminders(ctx.author.id);
		if (reminders.length == 0) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.listreminders.noreminders",
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}),
				],
			});
		} else {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: getString(
							lang,
							"commands.listreminders.reminders.title",
						),
						description: getString(
							lang,
							"commands.listreminders.reminders.description",
						),
						fields: reminders.map((reminder) => ({
							name: getString(
								lang,
								"commands.listreminders.reminders.field.name",
								`#${reminder.id}`,
							),
							value: getString(
								lang,
								"commands.listreminders.reminders.field.value",
								`<t:${
									(new Date(reminder.remind_at)
										.getTime() / 1000)
										.toFixed(0)
								}:R>`,
								`https://discord.com/channels/${reminder.server_id}/${reminder.channel_id}/${reminder.message_id}`,
								reminder.reminder,
							),
							inline: true,
						})),
					}).setColor("random"),
				],
			});

			
		}
	}
}
