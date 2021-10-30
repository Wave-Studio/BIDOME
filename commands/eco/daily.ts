import { Command, CommandContext, Embed } from 'harmony';
import {
	getProfileFromDatabase,
	saveProfile,
	shouldLevelUp,
	onLevelUp
} from 'eco';
import { formatMs, getRandomInteger } from 'tools';

export class command extends Command {
	name = 'daily';
	aliases = ['d'];
	description = 'Claim your daily coins';
	category = 'eco';
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		const profile = await getProfileFromDatabase(
			ctx.guild.id,
			ctx.author.id,
			ctx.author.tag
		);
		if (profile.lastDailyClaim) {
			const time = profile.lastDailyClaim + 60 * 1000 * 60 * 24;
			if (time > Date.now()) {
				return await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Daily',
						description: `You need to wait ${formatMs(time - Date.now())}`,
					}).setColor('random'),
				});
			}
		}
		const added = getRandomInteger(
			200 + profile.level * 10 - 10,
			500 + profile.level * 10 - 10
		);
		profile.levelXp += getRandomInteger(1, 10);
		profile.balance += added;
		profile.lastDailyClaim = Date.now();
		profile.lastKnownUsername = ctx.author.tag;
		if (shouldLevelUp(profile.level, profile.levelXp)) {
			onLevelUp(profile);
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Level up!',
					description: `You have leveled up to level ${profile.level}!`,
				}).setColor('random'),
			});
		}
		saveProfile(ctx.guild.id, profile);
		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: 'Daily',
				description: `You have received $${added}`,
			}).setColor('random'),
		});
	}
}
