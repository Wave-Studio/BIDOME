import { Command, CommandContext, Embed, TextChannel } from "harmony";
import { getSuggestionChannels } from "settings";
import { createEmbedFromLangData, getUserLanguage } from "i18n";
import { truncateString } from "tools";

export default class Suggest extends Command {
	name = "suggest";
	description = "Suggest something to the server";
	category = "utils";
	aliases = ["suggestion"];
	cooldown = 1 * 60 * 1000;

	async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author.id);
		const suggestionChannels = await getSuggestionChannels(ctx.guild!.id);
		if (suggestionChannels.suggestion_channel == undefined) {
			await ctx.message.reply({
				embeds: [
					new Embed({
						...createEmbedFromLangData(lang, "commands.suggest.notconfigured"),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}).setColor("red"),
				],
			});
		} else {
			if (ctx.argString.trim() == "") {
				await ctx.message.reply({
					embeds: [
						new Embed({
							...createEmbedFromLangData(lang, "commands.suggest.noargs"),
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
						}).setColor("red"),
					],
				});
			} else {
				const channel = (await ctx.guild!.channels.resolve(
					suggestionChannels.suggestion_channel
				)) as TextChannel | undefined;
				if (channel == undefined) {
					await ctx.message.reply({
						embeds: [
							new Embed({
								...createEmbedFromLangData(lang, "commands.suggest.nochannel"),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}).setColor("red"),
						],
					});
				} else {
					const suggestion = await channel.send({
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.suggest.suggestionmessage",
									`<@!${ctx.author.id}>`,
									ctx.argString
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								footer: {
									icon_url: ctx.author.avatarURL(),
									text: "Chat in the thread below!",
								},
							}),
						],
					});

					await Promise.allSettled([
						(async () => {
							await suggestion.addReaction("👍");
							await suggestion.addReaction("👎");
						})(),
						(async () => {
							const thread = await suggestion.startThread({
								name: truncateString(ctx.argString, 30),
							});
							await thread.addUser(ctx.author);
						})(),
					]);

					await ctx.message.reply({
						embeds: [
							new Embed({
								...createEmbedFromLangData(lang, "commands.suggest.sent"),
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
