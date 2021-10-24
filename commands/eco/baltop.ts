import { Command, CommandContext, Embed } from 'harmony';
import { getAllProfiles, isServerEco, EcoUserDBObject } from 'eco';
import {removeDiscordCodeBlocks} from "tools";

export class command extends Command {
	name = 'baltop';
	aliases = ['btop'];
	description = 'Shows the top users by balance';
	category = 'eco';
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		let ecoWorth = 0;
		const sortedProfiles = (getAllProfiles(ctx.guild.id) ?? [])
			.filter(({ balance }) => balance !== 0)
			.sort((a, b) => b.balance - a.balance);

		for (const profile of sortedProfiles) {
			ecoWorth += profile.balance;
		}

		if (sortedProfiles.length === 0) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Eco',
					description: `Sorry! There are no users currently with money.`,
				}).setColor('random'),
			});
		} else {
			const top10Users: { position: number; data: EcoUserDBObject }[] = [];

			for (
				let i = 1;
				i <= (sortedProfiles.length > 10 ? 10 : sortedProfiles.length);
				i++
			) {
				top10Users.push({
					position: i,
					data: sortedProfiles[i - 1],
				});
			}

			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Eco',
					description: `Economy worth: \`$${ecoWorth}\`${top10Users.map(
						({ position, data }) =>
							`\n\n#${position} <@!${data.userid}>\n  - Balance: \`$${data.balance}\` \n  - User: \`${removeDiscordCodeBlocks(data.lastKnownUsername)}\``
					).join("")}`,
					footer: {
						text: `Top ${
							sortedProfiles.length > 10 ? 10 : sortedProfiles.length
						} users for ${
							isServerEco(ctx.guild.id) ? 'this server' : 'all bidome users'
						}`,
					},
				}).setColor('random'),
			});
		}
	}
}
