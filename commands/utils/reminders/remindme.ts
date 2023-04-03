import { Command, CommandContext, Embed } from "harmony";
import { toMs, truncateString } from "tools";
import { createEmbedFromLangData, getUserLanguage } from "i18n";
import { getReminders, supabase } from "supabase";

export default class RemindMe extends Command {
	name = "remindme";
	aliases = ["createreminder"];
	category = "utils";
	description = "Create a reminder";
	async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author);
		const reminders = await getReminders(ctx.author.id);

		if (reminders.length >= 10) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.createreminder.error.toomany",
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}),
				],
			});
		} else {
			if (ctx.argString == "") {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"commands.createreminder.error.noargs",
							),
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
						}),
					],
				});
			} else {
				const [timestamp, ...messageSplit] = ctx.argString.split(" ");
				const message = messageSplit.join(" ");
				if (message == "") {
					await ctx.message.reply(undefined, {
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.createreminder.error.nomessage",
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}),
						],
					});
				} else {
					const ms = toMs(timestamp);
					if (ms < 0 || isNaN(ms)) {
						await ctx.message.reply(undefined, {
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"commands.createreminder.error.invalidtime",
									),
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
								}),
							],
						});
					} else {
						const { data } = await supabase.from("reminders")
							.insert({
								remind_at: new Date(Date.now() + ms)
									.toUTCString(),
								user_id: ctx.author.id,
								message_id: ctx.message.id,
								channel_id: ctx.channel.id,
								server_id: ctx.guild!.id,
								reminder: truncateString(message, 100),
							}).select();

						const time = (new Date().getTime() / 1000 + ms / 1000)
							.toFixed(
								0,
							);

						await ctx.message.reply(undefined, {
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"commands.createreminder.success",
										// No clue why it's 1 less but ok
										`#${data![0].id + 1}`,
										`<t:${time}:R>`,
										truncateString(message, 100),
									),
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
								}),
							],
						});
					}
				}
			}
		}
	}
}
