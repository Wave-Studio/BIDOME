import { Command, CommandContext, Embed } from 'harmony';
import { Manager } from 'lavalink';
import { GuildQueue } from 'types/music';

export const queue = new Map<string, GuildQueue>();
export const lavalink = new Manager(
	JSON.parse(await Deno.readTextFile('./assets/music.json')).nodes,
	{
		send(_, _payload) {},
	}
);

export class command extends Command {
	name = 'summon';
	description = 'Summon the bot';
	category = 'music';
	usage = 'Summon';
	aliases = ['join'];
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		if (
			queue.has(ctx.guild.id) &&
			!ctx.message.member?.permissions.serialize().ADMINISTRATOR
		) {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.client.user?.avatarURL(),
					},
					title: 'Music',
					description:
						"I'm currently connected to a channel & playing music!",
				}),
			});
			return;
		} else {
			const voice = await ctx.guild?.voiceStates.get(ctx.author.id);
			if (typeof voice === 'undefined' || !voice.channelID) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Music',
						description:
							'You are not currently connected to a channel!',
					}),
				});
			} else {
				queue.set(ctx.guild.id, {
					dj: ctx.author.id,
					songs: [],
					player: lavalink.create(ctx.guild.id),
				});
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.client.user?.avatarURL(),
						},
						title: 'Music',
						description: 'I have joined your channel!',
					}),
				});
			}
		}
	}
}
