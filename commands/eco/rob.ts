import { Command, CommandContext, Embed, User } from 'harmony';
import { getProfileFromDatabase, saveProfile } from 'eco';
import { getRandomInteger } from 'tools';

export class command extends Command {
	name = 'rob';
	aliases = ['steal'];
	description = 'Rob a user';
	category = 'eco';
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		if ((await ctx.message.mentions.users.first()) == undefined) {
			return await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Eco',
					description: `You need to mention someone to rob them!`,
				}).setColor('random'),
			});
		} else {
			const user = (await ctx.message.mentions.users.first()) as User;
			if (user.id == ctx.author.id) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome Eco',
						description: `You can't rob yourself!`,
					}).setColor('random'),
				});
			} else {
				if (user.bot) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: 'Bidome bot',
								icon_url: ctx.message.client.user?.avatarURL(),
							},
							title: 'Bidome Eco',
							description: `You can't rob bots!`,
						}).setColor('random'),
					});
				} else {
					const profile = await getProfileFromDatabase(
						ctx.guild.id,
						ctx.author.id,
						ctx.author.tag
					);
					if (profile.balance < 500) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url: ctx.message.client.user?.avatarURL(),
								},
								title: 'Bidome Eco',
								description: `You need to have $500 to rob someone!`,
							}).setColor('random'),
						});
					} else {
						const targetProfile = await getProfileFromDatabase(
							ctx.guild.id,
							user.id,
							user.tag
						);
						if (targetProfile.balance < 500) {
							await ctx.message.reply(undefined, {
								embed: new Embed({
									author: {
										name: 'Bidome bot',
										icon_url: ctx.message.client.user?.avatarURL(),
									},
									title: 'Bidome Eco',
									description: `That user doesn't have $500!`,
								}).setColor('random'),
							});
						} else {
							if (getRandomInteger(0, 100) > 35) {
								profile.balance -= 500;
								targetProfile.balance += 500;
								saveProfile(ctx.guild.id, profile);
								saveProfile(ctx.guild.id, targetProfile);
								await ctx.message.reply(undefined, {
									embed: new Embed({
										author: {
											name: 'Bidome bot',
											icon_url: ctx.message.client.user?.avatarURL(),
										},
										title: 'Bidome Eco',
										description: `You got caught and gave ${user.tag} $500`,
									}).setColor('random'),
								});
							} else {
								const stolenAmount = getRandomInteger(
									500,
									targetProfile.balance
								);
								profile.balance += stolenAmount;
								targetProfile.balance -= stolenAmount;
								saveProfile(ctx.guild.id, profile);
								saveProfile(ctx.guild.id, targetProfile);
								await ctx.message.reply(undefined, {
									embed: new Embed({
										author: {
											name: 'Bidome bot',
											icon_url: ctx.message.client.user?.avatarURL(),
										},
										title: 'Bidome Eco',
										description: `💸 You managed to get away with $${stolenAmount}!`,
									}).setColor('random'),
								});
							}
						}
					}
				}
			}
		}
	}
}
