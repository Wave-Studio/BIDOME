import { Command, CommandContext, Embed } from "harmony";
import { createEmbedFromLangData, getUserLanguage } from "i18n";
import { format } from "tools";

export default class UserInfo extends Command {
	name = "userinfo";
	aliases = ["ui"];
	description = "Get information about a user";
	category = "utils";
	usage = "userinfo [user]";

	async execute(ctx: CommandContext) {
		const userId =
			ctx.argString != ""
				? /<@!?[0-9]{17,19}>/.test(ctx.argString.trim())
					? ctx.argString.replace(/<@!?([0-9]{17,19})>/, "$1")
					: ctx.argString
				: ctx.member!.id;
		let user = await ctx.guild!.members.resolve(userId);
		if (user == undefined || user.user.username == undefined) {
			user = await ctx.guild!.members.fetch(userId);
		}
		const lang = await getUserLanguage(ctx.author.id);

		if (user == undefined) {
			await ctx.message.reply(
				new Embed({
					...createEmbedFromLangData(lang, "commands.userinfo.notyours"),
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
				}).setColor("red")
			);
		} else {
			const presence = await ctx.guild!.presences.resolve(user.id);
			await ctx.message.reply(
				new Embed({
					...createEmbedFromLangData(
						lang,
						"commands.userinfo.info",
						`${user.user.tag} ${
							user.nick != undefined ? `(${user.nick})` : ""
						}`,
						`<@!${user.id}>`,
						`<t:${(new Date(user.timestamp).getTime() / 1000).toFixed(0)}:F>`,
						`<t:${(new Date(user.joinedAt).getTime() / 1000).toFixed(0)}:F>`,
						format(
							presence?.clientStatus.desktop ??
								presence?.clientStatus.mobile ??
								presence?.clientStatus.web ??
								"offline"
						),
						await user.roles.size(),
						(
							await user.roles.array()
						)
							.slice(0, 46)
							.map((r) => `<@&${r.id}>`)
							.join(", ") +
							((
								await user.roles.array()
							).sort((r1, r2) => {
								return r1.name.localeCompare(r2.name);
							}).length > 46
								? "..."
								: "")
					),
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					thumbnail: {
						url: user.user.avatarURL()!,
					},
				})
			);
		}
	}
}
