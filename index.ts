import {
	CommandClient,
	CommandContext,
	Embed,
	GatewayIntents,
	isMessageComponentInteraction,
	InteractionResponseType,
} from "harmony";
import { getRandomStatus } from "status";
import { initLava } from "queue";
import { getPrefixes, supabase } from "supabase";
import { loopFilesAndReturn } from "tools";
import { interactionHandlers } from "shared";
import { getString } from "i18n";

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string | string[]> {
		if (Deno.env.get("IS_LOCAL") == "true") {
			return "!>"
		}
		if (Deno.env.get("IS_DEV") == "true") {
			return ">>";
		}
		return await getPrefixes(guildid);
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

bot.on("gatewayError", (err) => {
	console.log("Gateway error occured", err);
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
					title: getString("en", "errors.genericCommand.title"),
					description: getString("en", "errors.genericCommand.description"),
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

bot.on(
	"commandUserMissingPermissions",
	async (ctx: CommandContext, missing: string[]) => {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: getString("en", "errors.missingPerms.title"),
					description: getString(
						"en",
						"errors.missingPerms.description",
						missing.join(", ")
					),
				}).setColor("red"),
			],
		});
	}
);

const lifetimeCommandDataCache: {
	[key: string]: number;
} = {};

bot.on("commandUsed", async (ctx: CommandContext) => {
	if (Deno.env.get("IS_DEV") == "true") return;

	if (lifetimeCommandDataCache[ctx.command.name] == undefined) {
		const { data } = await supabase.from("lifetimecmdanalytics").select("times").eq("command", ctx.command.name).eq("ran_on", Date.now());
		if (data == undefined || data.length == 0) {
			lifetimeCommandDataCache[ctx.command.name] = 0;
			await supabase.from("lifetimecmdanalytics").insert({ times: lifetimeCommandDataCache[ctx.command.name], "command": ctx.command.name});
		} else {
			lifetimeCommandDataCache[ctx.command.name] = data[0].times;
		}
	}

	lifetimeCommandDataCache[ctx.command.name] = lifetimeCommandDataCache[ctx.command.name] + 1;
	await supabase.from("lifetimecmdanalytics").update({ times: lifetimeCommandDataCache[ctx.command.name] }).eq("command", ctx.command.name);
});

const nextStatus = async () => {
	if (bot.gateway.connected) {
		const { type, name } = await getRandomStatus(bot);
		try {
			bot.setPresence({
				activity: {
					name,
					type,
				},
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
