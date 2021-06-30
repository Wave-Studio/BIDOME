import { Command, CommandContext, Embed } from 'harmony';

export class command extends Command {
	name = 'botinfo';
	category = 'misc';
	aliases = ['botstats'];
	description = 'Get bot information';
	usage = 'Botinfo';
	async execute(ctx: CommandContext) {
		const data = {
			servers: 0,
			roles: 0,
			channels: 0,
			humans: 0,
			bots: 0,
		};

		for (const guild of await ctx.message.client.guilds.array()) {
			data.servers++;
			data.roles += await guild.roles.size();
			data.channels += await guild.channels.size();
			data.humans += await (
				await guild.members.array()
			).filter((m) => !m.user.bot).length;
			data.bots += await (
				await guild.members.array()
			).filter((m) => m.user.bot).length;
		}

		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				fields: [
					{
						name: 'Servers',
						value: `\`${data.servers}\``,
						inline: true,
					},
					{
						name: 'Accounts',
						value: `\`${data.humans + data.bots}\``,
						inline: true,
					},
					{
						name: 'Roles',
						value: `\`${data.roles}\``,
						inline: true,
					},
					{
						name: 'Channels',
						value: `\`${data.channels}\``,
						inline: true,
					},
					{
						name: 'Humans',
						value: `\`${data.humans}\``,
						inline: true,
					},
					{
						name: 'Bots',
						value: `\`${data.bots}\``,
						inline: true,
					},
				],
			}).setColor('random'),
		});
	}
}
