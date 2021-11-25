import { CommandClient, GatewayIntents, CommandContext, Embed } from 'harmony';
import { Database, initDatabases } from 'database';
import { getRandomStatus } from 'status';

import 'https://deno.land/x/dotenv@v3.0.0/load.ts';

if (!Deno.args.includes('--no-lava')) {
	Deno.run({
		cmd: ['java', '-jar', 'lavalink/Lavalink.jar'],
	});
} else {
	console.log("Flag '--no-lava' detected, not launching lavalink");
}

const isProdTesting = true;

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string> {
		if (isProdTesting) return "<@!778670182956531773>";
		let prefix = (await Database.get('prefix.' + guildid)) as string;
		if (typeof prefix === 'undefined') {
			prefix = '!';
			await Database.set('prefix.' + guildid, prefix);
		}
		return prefix;
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
	console.log('Loading Database');
	initDatabases();
	console.log('Loading all commands!');
	for await (const commands of Deno.readDir('./commands/')) {
		if (commands.name.startsWith('-')) continue;
		if (
			commands.isFile &&
			(commands.name.endsWith('.ts') || commands.name.endsWith('.tsx'))
		) {
			bot.commands.add((await import(`./commands/${commands.name}`)).command);
		} else {
			for await (const subcommand of Deno.readDir(
				`./commands/${commands.name}`
			)) {
				if (
					subcommand.isFile &&
					(subcommand.name.endsWith('.ts') || subcommand.name.endsWith('.tsx'))
				) {
					if (subcommand.name.startsWith('-')) continue;
					bot.commands.add(
						(await import(`./commands/${commands.name}/${subcommand.name}`))
							.command
					);
				}
			}
		}
	}

	for await (const extension of Deno.readDir('./extensions')) {
		if (
			extension.isFile &&
			(extension.name.endsWith('.ts') || extension.name.endsWith('.tsx'))
		) {
			if (extension.name.startsWith('-')) continue;
			bot.extensions.load(
				(await import(`./extensions/${extension.name}`)).extension
			);
		}
	}

	console.log(
		`Loaded ${await bot.commands.list.size} command${
			bot.commands.list.size == 1 ? '' : 's'
		} and ${await bot.extensions.list.size} extension${
			bot.extensions.list.size == 1 ? '' : 's'
		}!`
	);
	console.log('Loaded bot!');

	setInterval(() => {
		nextStatus();
	}, 30000);
});

bot.on('commandError', async (ctx: CommandContext, err: Error) => {
	console.log(
		`An error occured while executing ${ctx.command.name}! Here is the stacktrace:`
	);
	console.log(err);
	await ctx.message.reply(undefined, {
		embed: new Embed({
			author: {
				name: 'Bidome bot',
				icon_url: ctx.message.client.user?.avatarURL(),
			},
			title: 'An error occured!',
			description:
				'An error occured while executing this command! If this command continues erroring please alert a developer!',
		}).setColor('random'),
	});
});

const nextStatus = async () => {
	const { type, name, status } = await getRandomStatus(bot);
	bot.setPresence({
		activity: {
			name,
			type,
		},
		status: status ?? 'idle',
	});
};

// Prevent console spam from lavalink
// not being ready
setTimeout(
	() => {
		bot.connect(Deno.env.get('token'), [
			GatewayIntents.GUILDS,
			GatewayIntents.GUILD_MESSAGES,
			GatewayIntents.GUILD_VOICE_STATES,
			GatewayIntents.GUILD_PRESENCES,
		]);
	},
	// Prevent users from waiting when lavalink isn't being launched
	Deno.args.includes('--no-lava') ? 1 : 1.5 * 1000
);
