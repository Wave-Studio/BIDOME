import { Command, CommandContext, Embed } from "harmony";
import { createEmbedFromLangData, getUserLanguage } from "i18n";

export default class UserInfo extends Command {
	name = "userinfo";
	aliases = ["ui"];
	description = "Get information about a user";
	category = "utils";
	usage = "userinfo [user]";

	async execute(ctx: CommandContext) {
		const userId = ctx.argString != ""
			? /<@!?[0-9]{17,19}>/.test(ctx.argString.trim())
				? ctx.message.mentions.users.first()!.id
				: ctx.argString
			: ctx.member!.id;
		const user = (await ctx.guild!.members.resolve(userId))!;
		const lang = await getUserLanguage(ctx.author.id);

		if (user == undefined) {
			await ctx.message.reply(
				new Embed({
					...createEmbedFromLangData(
						lang,
						"commands.userinfo.notyours",
					),
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
				}).setColor("red"),
			);
		} else {
			await ctx.message.reply(
				new Embed({
					...createEmbedFromLangData(
						lang,
						"commands.userinfo.info",
						`${user.user.tag} ${
							user.nick != undefined ? `(${user.nick})` : ""
						}`,
						`<@!${user.id}>`,
						`<t:${
							(new Date(user.timestamp).getTime() / 1000).toFixed(
								0,
							)
						}:F>`,
						`<t:${
							(new Date(user.joinedAt).getTime() / 1000).toFixed(
								0,
							)
						}:F>`,
						`Soon™`,
						(
							await user.roles.array()
						)
							.slice(0, 46)
							.map((r) => `<@&${r.id}>`)
							.join(", ") +
							((
									await user.roles.array()
								).sort((r1, r2) => {
									console.log(
										r1.position,
										r2.position,
										r1.name,
										r2.name,
									);
									return r1.position - r2.position;
								}).length > 46
								? "..."
								: ""),
					),
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
				}),
			);
		}
	}
}
