import { Command, CommandContext, Embed, subcommand } from 'harmony';
import {
	getProfileFromDatabase,
	saveProfile,
	shouldLevelUp,
	onLevelUp
} from 'eco';
import { formatMs, getRandomInteger } from 'tools';
import { jobs } from 'jobs';

export class command extends Command {
	name = 'work';
	aliases = ['job'];
	description = 'Work to earn money';
	category = 'eco';
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		const profile = await getProfileFromDatabase(
			ctx.guild.id,
			ctx.author.id,
			ctx.author.tag
		);
		if (profile.job == undefined) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome eco',
					description: `You are not currently in a job! Use \`${ctx.prefix}job list\` to join a job`,
				}).setColor('random'),
			});
		} else {
			const userJob = jobs.find((job) => job.id == profile.job!.id);
			if (userJob == undefined) return;
			if (profile.job.lastJobTime == undefined) {
				profile.job.lastJobTime = 0;
			}
			if (profile.job.lastJobTime + userJob.cooldown < Date.now()) {
				const earnedMoney = getRandomInteger(
					userJob.salary.min,
					userJob.salary.max
				);
				profile.levelXp += getRandomInteger(1, 10);
				profile.job.lastJobTime = Date.now();
				profile.balance += earnedMoney;
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome eco',
						description: `You worked as \`${userJob.name}\` and earned $${earnedMoney}`,
					}).setColor('random'),
				});
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
			} else {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome eco',
						description: `You need to wait \`${formatMs(
							profile.job.lastJobTime + userJob.cooldown - Date.now()
						)}\` before you can work again!`,
					}).setColor('random'),
				});
			}
		}
	}

	@subcommand({
		name: 'list',
	})
	// Bug with harmony
	@subcommand({
		name: 'jobs',
	})
	@subcommand({
		name: 'l',
	})
	async listJobs(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: 'Bidome eco',
				fields: jobs.map((job) => ({
					name: job.name,
					value: [
						`Salary: \`${job.salary.min} - ${job.salary.max}\``,
						`Cooldown: \`${formatMs(job.cooldown)}\``,
					].join('\n'),
					inline: true,
				})),
				footer: {
					text: `Join with ${ctx.prefix}job join <name>`,
				},
			}).setColor('random'),
		});
	}

	@subcommand({
		name: 'apply',
	})
	@subcommand({
		name: 'join',
	})
	@subcommand({
		name: 'j',
	})
	@subcommand({
		name: 'a',
	})
	async joinJob(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		if (ctx.argString != '') {
			const filteredJobs = jobs.filter(
				(job) =>
					job.name.toLowerCase() == ctx.argString.toLowerCase() ||
					job.aliases
						.map((j) => j.toLowerCase())
						.includes(ctx.argString.toLowerCase())
			);
			if (filteredJobs.length == 0) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome eco',
						description: `That's an invalid job! Use ${ctx.prefix}job list to see all jobs`,
					}).setColor('random'),
				});
			} else {
				const userProfile = await getProfileFromDatabase(
					ctx.guild.id,
					ctx.author.id,
					ctx.author.tag
				);

				if (userProfile.job != undefined) {
					const userJob = jobs.find((job) => job.id == userProfile.job!.id);
					if (
						(userProfile.job.lastJobTime ?? 0) + userJob!.cooldown >
						Date.now()
					) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: 'Bidome bot',
									icon_url: ctx.message.client.user?.avatarURL(),
								},
								title: 'Bidome eco',
								description: `You need to wait \`${formatMs(
									(userProfile.job.lastJobTime ?? 0) +
										userJob!.cooldown -
										Date.now()
								)}\` before you can join a new job!`,
							}).setColor('random'),
						});
						return;
					}
				}

				userProfile.job = {
					id: filteredJobs[0].id,
					lastJobTime: 0,
				};

				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome eco',
						description: `You have joined ${filteredJobs[0].name}! Use ${ctx.prefix}job to work.`,
					}).setColor('random'),
				});

				saveProfile(ctx.guild.id, userProfile);
			}
		} else {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome eco',
					description: 'You need to provide a job to join!',
				}).setColor('random'),
			});
		}
	}

	@subcommand({
		name: 'leave',
	})
	@subcommand({
		name: 'resign',
	})
	async leaveJob(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		const userProfile = await getProfileFromDatabase(
			ctx.guild.id,
			ctx.author.id,
			ctx.author.tag
		);

		if (userProfile.job != undefined) {
			const userJob = jobs.find((job) => job.id == userProfile.job!.id);
			if ((userProfile.job.lastJobTime ?? 0) + userJob!.cooldown > Date.now()) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome eco',
						description: `You need to wait \`${formatMs(
							(userProfile.job.lastJobTime ?? 0) +
								userJob!.cooldown -
								Date.now()
						)}\` before you can resign!`,
					}).setColor('random'),
				});
				return;
			}
		} else {
			userProfile.job = undefined;
			saveProfile(ctx.guild.id, userProfile);
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome eco',
					description: 'You have left your job!',
				}).setColor('random'),
			});
		}
	}
}
