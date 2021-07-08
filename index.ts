import { CommandClient, GatewayIntents } from 'harmony';
import { ReplitDB } from 'replitdb';
import { token } from 'env';
import { Manager } from 'lavalink';

// Deno.run({
// 	cmd: ['cmd', '/c', 'java -jar assets/lavalink.jar'],
// });

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string> {
		let prefix = await ReplitDB.get('prefix.' + guildid);
		if (typeof prefix === 'undefined') {
			prefix = '!';
			await ReplitDB.set('prefix.' + guildid, prefix);
		}
		return prefix + '>';
	},
	allowBots: false,
	allowDMs: false,
	mentionPrefix: true,
	caseSensitive: false,
	presence: {
		activity: {
			name: 'Bidome Bot | Starting up',
			type: 'PLAYING',
		},
		status: 'idle',
	},
	enableSlash: false,
	spacesAfterPrefix: true,
	owners: ['314166178144583682', '423258218035150849'],
});

bot.on('ready', async () => {
	console.log(`Logged in as ${bot.user?.tag}`);
	console.log('Loading all commands!');
	for await (const commands of Deno.readDir('./commands/')) {
		if (
			commands.isFile &&
			(commands.name.endsWith('.ts') || commands.name.endsWith('.tsx'))
		) {
			bot.commands.add(
				(await import(`./commands/${commands.name}`)).command
			);
		} else {
			for await (const subcommand of Deno.readDir(
				`./commands/${commands.name}`
			)) {
				if (
					subcommand.isFile &&
					(subcommand.name.endsWith('.ts') ||
						subcommand.name.endsWith('.tsx'))
				) {
					bot.commands.add(
						(
							await import(
								`./commands/${commands.name}/${subcommand.name}`
							)
						).command
					);
				}
			}
		}
	}
	console.log(`Loaded ${await bot.commands.list.size} commands!`);

	// Jank fix for lavalink
	(await import('./commands/music/join.ts')).lavalinkManagers.push(
		new Manager(
			JSON.parse(await Deno.readTextFile('./assets/music.json')).nodes,
			{
				send(_, payload) {
					bot.gateway.send(payload);
				},
			}
		)
	);
	console.log('Loaded bot!');
});

bot.connect(token, [GatewayIntents.GUILDS, GatewayIntents.GUILD_MESSAGES]);
