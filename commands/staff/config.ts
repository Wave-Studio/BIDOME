import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
	InteractionResponseType,
} from 'harmony';
import { ReplitDB } from 'replitdb';

export class command extends Command {
	name = 'config';
	aliases = ['settings', 'options'];
	category = 'staff';
	userPermissions = 'ADMINISTRATOR';
	description = 'Change settings regarding bidome';
	usage = 'Config';
	async execute(ctx: CommandContext) {
		const currentTime = Date.now();
		const message = await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				description: 'Please select a category from below!',
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
							label: 'Prefix',
							customID: 'prefix-' + currentTime,
							style: 'BLURPLE',
						},
					],
				},
			],
		});
		const response = await ctx.message.client.waitFor(
			'interactionCreate',
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith('-' + currentTime) &&
				i.user.id === ctx.message.author.id,
			30 * 1000
		);

		const res = response[0];

		if (!res) {
			await message.edit({
				components: [],
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					description: 'Config prompt timed out!',
				}).setColor('random'),
			});
			return;
		} else {
			if (!isMessageComponentInteraction(res)) return;
			if (res.customID.split('-')[0] === 'prefix') {
				await message.edit({
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									label: 'Change prefix',
									customID: 'changeprefix-' + currentTime,
									style: 'BLURPLE',
								},
							],
						},
					],
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						description:
							'Current prefix: `' +
							(await ReplitDB.get(
								'prefix.' + ctx.message.guild?.id
							)) +
							'`',
						footer: {
							text: 'Changing the prefix will time out in 30 seconds!',
						},
					}).setColor('random'),
				});
				await res.respond({
					type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
				});
				const changePrefix = await ctx.message.client.waitFor(
					'interactionCreate',
					(i) =>
						isMessageComponentInteraction(i) &&
						i.customID.endsWith('-' + currentTime) &&
						i.user.id === ctx.message.author.id,
					30 * 1000
				);
				const willChange = changePrefix[0];
				if (!willChange) {
					await message.edit({
						components: [],
						embed: new Embed({
							author: {
								name: 'Bidome bot',
								icon_url: ctx.message.client.user?.avatarURL(),
							},
							description: 'Prefix change timed out!',
						}).setColor('random'),
					});
				} else {
					await message.edit({
						components: [],
						embed: new Embed({
							author: {
								name: 'Bidome bot',
								icon_url: ctx.message.client.user?.avatarURL(),
							},
							description: 'Please send the new prefix in chat!',
							fields: [
								{
									name: 'Prefix rules',
									value: [
										'```yml',
										' - Must be 5 characters or fewer in length',
										' - Allowed characters: ',
										'  - A-Z 0-9 !@#$%^&*()<>,.?/|;{}[]:+=-',
										'```',
									].join('\n'),
								},
							],
							footer: {
								text: 'This will time out in 30 seconds!',
							},
						}).setColor('random'),
					});
					const newPrefix = await ctx.message.client.waitFor(
						'messageCreate',
						(i) =>
							i.channel.id === ctx.message.channel.id &&
							ctx.message.author.id === i.author.id,
						30 * 1000
					);
					const prefix = newPrefix[0];
					if (!prefix) {
						await message.edit({
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url:
										ctx.message.client.user?.avatarURL(),
								},
								description: 'Prefix change timed out!',
							}).setColor('random'),
						});
					} else {
						const allowedChars =
							'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()<>,.?/|;{}[]:+=-'.split(
								''
							);
						if (prefix.content.length > 5) {
							await prefix.reply(undefined, {
								embed: new Embed({
									author: {
										name: 'Bidome bot',
										icon_url:
											ctx.message.client.user?.avatarURL(),
									},
									description:
										'Prefix length is longer than the maximum allowed! (5)',
								}).setColor('random'),
							});
						}

						let shouldChangePrefix = true;

						for (const letter of prefix.content.toLowerCase()) {
							if (allowedChars.includes(letter)) continue;
							else {
								await prefix.reply(undefined, {
									embed: new Embed({
										author: {
											name: 'Bidome bot',
											icon_url:
												ctx.message.client.user?.avatarURL(),
										},
										description:
											'An invalid character was provided! `` ' +
											letter +
											' ``',
									}).setColor('random'),
								});
								shouldChangePrefix = false;
								return;
							}
						}
						if (!shouldChangePrefix) return;
						await ReplitDB.set(
							'prefix.' + ctx.message.guild?.id,
							prefix.content.toLowerCase()
						);
						await prefix.reply(undefined, {
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url:
										ctx.message.client.user?.avatarURL(),
								},
								description:
									'The prefix has been changed to `` ' +
									prefix.content.toLowerCase() +
									' ``',
							}).setColor('random'),
						});
					}
				}
			}
		}
	}
}
