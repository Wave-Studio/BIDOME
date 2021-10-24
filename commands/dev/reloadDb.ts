import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from 'harmony';
import { Database, GlobalEco, ServerEco, JsonDB } from 'database';

export class command extends Command {
	name = 'reloaddb';
	aliases = ['rldb'];
	ownerOnly = true;
	category = 'dev';
	description = 'Reload database';
	usage = 'reloaddb';
	async execute(ctx: CommandContext) {
		const now = Date.now();
		const message = await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: 'Bidome Reload',
				description: 'Please select a database',
				footer: {
					text: 'This will time out in 30 seconds!',
				},
			}).setColor('random'),
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							label: 'Core',
							customID: `core-${now}`,
							style: 'BLURPLE',
						},
						{
							type: 2,
							label: 'Global Eco',
							customID: `geco-${now}`,
							style: 'BLURPLE',
						},
						{
							type: 2,
							label: 'Server Eco',
							customID: `seco-${now}`,
							style: 'BLURPLE',
						},
					],
				},
			],
		});

		const [response] = await ctx.client.waitFor(
			'interactionCreate',
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith(`-${now}`) &&
				i.user.id === ctx.author.id,
			30000
		);
		
		if (!response) {
			return await message.edit(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Reload',
					description: 'Database reload timed out!',
				}).setColor('random'),
				components: [],
			});
		} else {
			if (!isMessageComponentInteraction(response)) return;
			let DatabaseToReload: JsonDB = Database;

			switch (response.customID.split('-')[0]) {
				case 'geco':
					DatabaseToReload = GlobalEco;
					break;
				case 'seco':
					DatabaseToReload = ServerEco;
					break;
			}

			await message.edit(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Reload',
					description: 'Reloading database!',
				}).setColor('random'),
				components: []
			});
			await DatabaseToReload.reload();
			await message.edit(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Reload',
					description: 'Database reloaded!',
				}).setColor('random'),
				components: [],
			});
		}
	}
}
