import {
	CommandClient,
	CommandContext,
	Embed,
	GatewayIntents,
	isMessageComponentInteraction,
	InteractionResponseType
} from "harmony";
import { getRandomStatus } from "status";
import { initLava } from "queue";
import { getPrefix } from "supabase";
import { loopFilesAndReturn } from "tools";
import { interactionHandlers } from "shared";

const logFunction = console.log;

console.log = (...args: unknown[]) => {
	const date = new Date();
	const amOrPm = date.getHours() > 12 ? "PM" : "AM";
	const hours = amOrPm == "AM" ? date.getHours() : date.getHours() - 12;

	logFunction(
		`[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${hours}:${
			date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
		}${amOrPm}]`,
		...args
	);
};

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string> {
		if (Deno.env.get("IS_DEV") == "true") {
			return ">>";
		}
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
		status: "online",
	},
	enableSlash: true,
	spacesAfterPrefix: true,
	owners: ["314166178144583682", "423258218035150849"],
	shardCount: "auto",
	clientProperties: {
		// Mild amount of tomfoolery
		browser: "Discord iOS",
	},
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

bot.on("debug", (message) => {
	console.log("Debug:", message);
});

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
				}).setColor("red"),
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

	if (i.customID.startsWith("disabled")) {
		await i.respond({
			type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
		});
	} else {
		for (const handler of interactionHandlers) {
			const res = await handler(i);
			if (typeof res == "boolean") {
				if (!res) {
					return;
				}
			}
		}
	}
});

bot.on("commandUserMissingPermissions", async (ctx: CommandContext, missing: string[]) => {
	await ctx.message.reply(undefined, {
		embeds: [
			new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.message.client.user!.avatarURL(),
				},
				title: "Missing permissions!",
				description:
					`You are missing the following permissions to run this command: \`${missing.join(", ")}\`!`,
			}).setColor("red"),
		],
	});
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
	GatewayIntents.MESSAGE_CONTENT,
	GatewayIntents.GUILD_EMOJIS_AND_STICKERS,
]);
