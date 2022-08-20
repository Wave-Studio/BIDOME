import {
	CommandClient,
	CommandContext,
	Embed,
	GatewayIntents,
	MessageComponentInteraction,
	isMessageComponentInteraction,
} from "harmony";
import { getRandomStatus } from "status";
import { initLava } from "queue";
import { getPrefix } from "supabase";

const logFunction = console.log;

console.log = (...args: unknown[]) => {
	const date = new Date();
	const amOrPm = date.getHours() >= 12 ? "PM" : "AM";
	const hours = amOrPm == "AM" ? date.getHours() : date.getHours() - 12;

	logFunction(`[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${hours}:${date.getMinutes()}${amOrPm}]`, ...args);
}

const interactionHandlers: ((
	i: MessageComponentInteraction
) => Promise<boolean | void>)[] = [];

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string> {
		return await getPrefix(guildid);
	},
	allowBots: false,
	allowDMs: false,
	mentionPrefix: true,
	caseSensitive: false,
	presence: {
		activity: {
			name: "Bidome Bot | Starting up",
			type: "PLAYING",
		},
		status: "idle",
	},
	enableSlash: true,
	spacesAfterPrefix: true,
	owners: ["314166178144583682", "423258218035150849"],
	shardCount: "auto",
});

bot.on("gatewayError", (_err) => {
	console.log("Gateway error occured");
});

bot.on("reconnect", () => {
	console.log("Reconnect requested. Reconnecting...");
});

bot.on("resumed", () => {
	console.log("Reconnected.");
});

bot.on("error", (_err) => {
	console.log("Error occured");
});

const loopFilesAndReturn = async (path: string) => {
	const files: string[] = [];

	try {
		await Deno.mkdir(path, { recursive: true });
	} catch {
		// Ignore
	}

	for await (const file of Deno.readDir(path)) {
		if (file.name.trim().startsWith("-")) continue;
		const uri = `${path}${path.endsWith("/") ? "" : "/"}${file.name}`;
		if (file.isFile) {
			for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
				if (file.name.trim().toLowerCase().endsWith(ext)) {
					files.push(uri);
				}
			}
		} else {
			if (file.isDirectory) {
				files.push(...(await loopFilesAndReturn(uri)));
			}
		}
	}

	return files;
};

bot.on("ready", async () => {
	console.log(`Logged in as ${bot.user!.tag}`);
	console.log("Loading all commands!");

	await initLava(bot);

	for (const cmd of await loopFilesAndReturn("./commands/")) {
		bot.commands.add((await import(cmd)).default);
	}

	for (const ext of await loopFilesAndReturn("./extensions/")) {
		bot.extensions.load((await import(ext)).default);
	}

	for (const int of await loopFilesAndReturn("./interactions/")) {
		interactionHandlers.push((await import(int)).default);
	}

	console.log(
		`Loaded ${await bot.commands.list.size} command${
			bot.commands.list.size == 1 ? "" : "s"
		} and ${await bot.extensions.list.size} extension${
			bot.extensions.list.size == 1 ? "" : "s"
		}!`
	);
	console.log("Loaded bot!");

	setInterval(() => {
		nextStatus();
	}, 30000);
});

bot.on("commandError", async (ctx: CommandContext, err: Error) => {
	console.log(
		`An error occured while executing ${ctx.command.name}! Here is the stacktrace:`
	);
	console.log(err);
	try {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "An error occured!",
					description:
						"An error occured while executing this command! If this command continues erroring please alert a developer!",
				}).setColor("random"),
			],
		});
	} catch {
		try {
			await ctx.message.addReaction("❗");
		} catch {
			return;
		}
	}
});

bot.on("interactionCreate", async (i) => {
	if (!isMessageComponentInteraction(i)) return;
	if (i.message.author.id != bot.user!.id) return;
	if (i.guild == undefined) return;

	for (const handler of interactionHandlers) {
		const res = await handler(i);
		if (typeof res == "boolean") {
			if (!res) {
				return;
			}
		}
	}
});

const nextStatus = async () => {
	if (bot.gateway.connected) {
		const { type, name, status } = await getRandomStatus(bot);
		try {
			bot.setPresence({
				activity: {
					name,
					type,
				},
				status: status ?? "idle",
			});
		} catch {
			console.log("status failed to be set");
		}
	}
};

bot.connect(Deno.env.get("token"), [
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MESSAGES,
	GatewayIntents.GUILD_VOICE_STATES,
	GatewayIntents.GUILD_PRESENCES,
	GatewayIntents.GUILD_MEMBERS,
]);
