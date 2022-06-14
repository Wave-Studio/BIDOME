import { Command, CommandContext, Embed, User } from "harmony";
import { calculateXPToNextLevel, getProfileFromDatabase } from "eco";

export default class Balance extends Command {
	name = "bal";
	aliases = ["balance"];
	description = "Check your balance.";
	category = "eco";
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		let user = ctx.author;
		if ((await ctx.message.mentions.users.first()) != undefined) {
			user = (await ctx.message.mentions.users.first()) as User;
		}
		if (user.bot) {
			return await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome Eco",
					description: `Bot's can't have a balance!`,
				}).setColor("random")],
			});
		} else {
			const profile = await getProfileFromDatabase(
				ctx.guild.id,
				user.id,
				user.tag,
			);
			await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "User balance",
					fields: [
						{
							name: "Balance",
							value: `$${profile.balance}`,
							inline: true,
						},
						{
							name: "Level",
							value: `${profile.level}`,
							inline: true,
						},
						{
							name: "XP",
							value: `${profile.levelXp}/${
								calculateXPToNextLevel(
									profile.level,
								)
							}`,
							inline: true,
						},
						{
							name: "Bank",
							value: `$${profile.bank}/$${profile.maxBankSpace}`,
							inline: true,
						},
					],
				}).setColor("random")],
			});
		}
	}
}
