import { Command, CommandContext, Embed } from 'harmony';

export class command extends Command {
	name = 'ping';
	category = 'misc';
	description = "Get the bot's ping";
	usage = 'Ping';
	async execute(ctx: CommandContext) {
		const now = new Date();
		const message = await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: 'Bidome ping',
				description: 'Collecting ping! Please wait',
			}),
		});
		const edited = new Date();
		await message.edit({
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: 'Bidome ping',
				fields: [
					{
						name: 'Ping values',
						value:
							'Websocket: `' +
							ctx.message.client.gateway.ping +
							'` \nPing: `' +
							(now.getTime() - ctx.message.timestamp.getTime()) +
							'` \nEdit: `' +
							(edited.getTime() - now.getTime()) +
							'`',
					},
				],
			}),
		});
	}
}
