import { Command, CommandContext, Embed } from 'harmony';

export class command extends Command {
	name = 'serverinfo';
	category = 'misc';
	description = 'Get information regarding this server';
	usage = 'Serverinfo';
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				fields: [
					{
						name: 'Accounts',
						value: `\`${ctx.message.guild?.memberCount}\``,
						inline: true,
					},
					{
						name: 'Humans',
						value: `\`${
							(
								await ctx.message.guild?.members.array()
							)?.filter((m) => !m.user.bot).length
						}\``,
						inline: true,
					},
					{
						name: 'Bots',
						value: `\`${
							(
								await ctx.message.guild?.members.array()
							)?.filter((m) => m.user.bot).length
						}\``,
						inline: true,
					},
					{
						name: 'Channels',
						value: `\`${await ctx.message.guild?.channels.size()}\``,
						inline: true,
					},
					{
						name: 'Roles',
						value: `\`${await ctx.message.guild?.roles.size()}\``,
						inline: true,
					},
					{
						name: 'Owner',
						value: `\`${
							(
								await ctx.message.client.users.get(
									ctx.message.guild?.ownerID as string
								)
							)?.tag
						}\``,
						inline: true,
					},
				],
			}).setColor('random'),
		});
	}
}
