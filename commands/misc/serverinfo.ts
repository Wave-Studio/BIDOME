import { Command, CommandContext, Embed } from "harmony";

export default class ServerInfo extends Command {
	name = "serverinfo";
	category = "misc";
	description = "Get information regarding this server";
	usage = "Serverinfo";
	async execute(ctx: CommandContext) {
		const data = {
			accounts: ctx.message.guild?.memberCount ?? 0,
			humans: (await ctx.message.guild?.members.array())?.filter(
				(m) => !m.user.bot,
			).length ?? 0,
			bots: (await ctx.message.guild?.members.array())?.filter(
				(m) => m.user.bot,
			).length ?? 1,
			channels: (await ctx.message.guild?.channels.size()) ?? 0,
			roles: (await ctx.message.guild?.roles.size()) ?? 0,
			owner: (
				await ctx.message.client.users.get(
					ctx.message.guild?.ownerID as string,
				)
			)?.tag ?? "Unknown",
		};

		const isCachedUsers = data.accounts != data.humans + data.bots;
		await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.message.client.user!.avatarURL(),
				},
				fields: [
					{
						name: `Accounts`,
						value: `\`${data.accounts}\``,
						inline: true,
					},
					{
						name: `Humans${isCachedUsers ? "*" : ""}`,
						value: `\`${data.humans}\``,
						inline: true,
					},
					{
						name: `Bots${isCachedUsers ? "*" : ""}`,
						value: `\`${data.bots}\``,
						inline: true,
					},
					{
						name: "Channels",
						value: `\`${data.channels}\``,
						inline: true,
					},
					{
						name: "Roles",
						value: `\`${data.roles}\``,
						inline: true,
					},
					{
						name: "Owner",
						value: `\`${data.owner}\``,
						inline: true,
					},
				],
				footer: {
					text: `${isCachedUsers ? "* Cached users" : ""}`,
				},
			}).setColor("random")],
		});
	}
}
