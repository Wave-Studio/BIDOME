import { Command, CommandContext, Embed } from "harmony";
import { getReminders, removeReminder } from "supabase";
import { createEmbedFromLangData, getUserLanguage } from "i18n";

export default class DeleteReminder extends Command {
	name = "deletereminder";
	aliases = ["rmreminder", "removereminder", "delreminder"];
	category = "utils";
	description = "Delete a reminder";
	async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author);
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.deletereminder.error.noargs",
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}).setColor("random"),
				],
			});
		} else {
			const reminders = await getReminders();
			const reminder = reminders.find((r) => r.id == ctx.argString);
			if (reminder == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"commands.deletereminder.error.invalid",
							),
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
						}).setColor("random"),
					],
				});
			} else {
				if (reminder.user_id != ctx.author.id) {
					await ctx.message.reply(undefined, {
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.deletereminder.error.notyours",
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}).setColor("random"),
						],
					});
				} else {
					await removeReminder(reminder.id);
					await ctx.message.reply(undefined, {
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.deletereminder.success",
									`#${reminder.id}`,
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}).setColor("random"),
						],
					});
				}
			}
		}
	}
}
