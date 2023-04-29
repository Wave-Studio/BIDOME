import {
	CommandClient,
	CommandContext,
	Embed,
	GatewayIntents,
	InteractionResponseType,
	isMessageComponentInteraction,
	MessageComponentData,
	TextChannel,
} from "harmony";
import { getRandomStatus } from "status";
import { initLava } from "queue";
import { getPrefixes, getReminders, removeReminder, supabase } from "supabase";
import { loopFilesAndReturn, toMs } from "tools";
import { interactionHandlers } from "shared";
import { getString, getUserLanguage } from "i18n";

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string | string[]> {
		if (Deno.env.get("IS_LOCAL") == "true") {
			return "!>";
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

console.log("Loading all extensions!");

for (const ext of await loopFilesAndReturn("./extensions/")) {
	bot.extensions.load((await import(ext)).default);
}

console.log(
	`Loaded ${await bot.extensions.list.size} extension${
		bot.extensions.list.size == 1 ? "" : "s"
	}!`
);

bot.on("ready", async () => {
	console.log(`Logged in as ${bot.user!.tag}`);
	console.log("Loaded bot!");
	console.log("Loading all commands!");

	await initLava(bot);

	for (const cmd of await loopFilesAndReturn("./commands/")) {
		bot.commands.add((await import(cmd)).default);
	}

	for (const int of await loopFilesAndReturn("./interactions/")) {
		interactionHandlers.push((await import(int)).default);
	}

	console.log(
		`Loaded ${await bot.commands.list.size} command${
			bot.commands.list.size == 1 ? "" : "s"
		}`
	);

	for await (const guild of bot.guilds) {
		await guild.chunk({});
	}

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
		const userLanguage = await getUserLanguage(ctx.author);
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: getString(userLanguage, "errors.missingPerms.title"),
					description: getString(
						userLanguage,
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
		const { data } = await supabase
			.from("cmd_analytics")
			.select("times")
			.eq("command", ctx.command.name)
			.eq("ran_on", Date.now());
		if (data == undefined || data.length == 0) {
			lifetimeCommandDataCache[ctx.command.name] = 0;
			await supabase.from("cmd_analytics").insert({
				times: lifetimeCommandDataCache[ctx.command.name],
				command: ctx.command.name,
			});
		} else {
			lifetimeCommandDataCache[ctx.command.name] = data[0].times;
		}
	}

	lifetimeCommandDataCache[ctx.command.name] =
		lifetimeCommandDataCache[ctx.command.name] + 1;
	await supabase
		.from("cmd_analytics")
		.update({
			times: lifetimeCommandDataCache[ctx.command.name],
		})
		.eq("command", ctx.command.name);
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

setInterval(async () => {
	if (Deno.env.get("IS_DEV") == "true") return;
	if (bot.gateway.connected) {
		for (const reminder of getReminders()) {
			const remind_at = new Date(reminder.remind_at);
			const now = Date.now();
			if (remind_at.valueOf() <= now) {
				const userLanguage = await getUserLanguage(reminder.user_id);
				const user = await bot.users.get(reminder.user_id);
				const createdAt = (
					new Date(reminder.created_at).getTime() / 1000
				).toFixed(0);

				const reminderMessage = new Embed({
					author: {
						name: "Bidome bot",
						icon_url: bot.user!.avatarURL(),
					},
					title: getString(
						userLanguage,
						"interactions.reminder.notify.title",
						`#${reminder.id}`
					),
					description: getString(
						userLanguage,
						"interactions.reminder.notify.description",
						`<t:${createdAt}:R>`,
						reminder.reminder
					),
					url: `https://discord.com/channels/${reminder.server_id}/${reminder.channel_id}/${reminder.message_id}`,
				}).setColor("random");
				const components: MessageComponentData[] = [];

				if (
					reminder.future_sends != undefined &&
					reminder.future_sends.length > 0
				) {
					const newDate =
						new Date(reminder.created_at).getTime() +
						toMs(reminder.future_sends[0]);
					const futureReminders = reminder.future_sends.slice(1);

					await supabase
						.from("reminders")
						.update({
							remind_at: new Date(newDate).toISOString(),
							future_sends: futureReminders,
						})
						.eq("id", reminder.id);

					if (futureReminders.length > 0) {
						components.push({
							type: 1,
							components: [
								{
									type: 2,
									style: "RED",
									label: getString(
										userLanguage,
										"interactions.reminder.button.delete"
									),
									customID: `delrem_${reminder.id}`,
								},
							],
						});
					} else {
						removeReminder(reminder.id);
					}
				} else {
					removeReminder(reminder.id);
				}

				try {
					await user?.send({
						embeds: [reminderMessage],
						components,
					});
				} catch {
					try {
						const channel = (await bot.channels.get(
							reminder.channel_id
						)) as TextChannel;
						await channel.send({
							content: `<@${reminder.user_id}>`,
							embeds: [reminderMessage],
							components,
						});
					} catch {
						// ignore
					}
				}
			}
		}
	}
}, 5000);

bot.connect(Deno.env.get("token"), [
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MESSAGES,
	GatewayIntents.GUILD_VOICE_STATES,
	GatewayIntents.GUILD_PRESENCES,
	GatewayIntents.GUILD_MEMBERS,
	GatewayIntents.MESSAGE_CONTENT,
	GatewayIntents.GUILD_EMOJIS_AND_STICKERS,
]);
