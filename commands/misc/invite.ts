import { Command, CommandContext, Embed } from 'harmony';

export class command extends Command {
	name = 'invite';
	category = 'misc';
	description = "Get the bot's invite";
	usage = 'Invite';
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.client.user?.avatarURL(),
				},
				description:
					'To invite Bidome to your server use [**this invite**](https://discord.com/api/oauth2/authorize?client_id=778670182956531773&permissions=8&scope=bot)',
			}).setColor('random'),
		});
	}
}
