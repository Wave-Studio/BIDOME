import {
	CommandBuilder,
	CommandClient,
	GatewayIntents,
	PermissionFlags,
} from "./imports/harmony.ts";

// Too lazy to use deno cli even though it's probably easier
const envfile = (await Deno.readTextFile(".env")).split("\n");

for (const line of envfile) {
	const [key, ...value] = line.split("=");
	if (key.trim() == "" || key.startsWith("#")) continue;
	const newValue =
		value.join("=").startsWith('"') && value.join("=").endsWith('"')
			? value.join("=").slice(1, -1)
			: value.join("=");
	Deno.env.set(key, newValue);
}

const bot = new CommandClient({
	prefix: ".",
});

bot.on("ready", () => {
	console.log("Bot is ready!");
});

const cmd = new CommandBuilder().setName("test").onExecute(async (ctx) => {
	const guild = ctx.guild!;

	for (const member of await guild.members.array()) {
		console.log(
			"Checking for",
			member.user.username,
			"Does have perms:",
			member.permissions.has(PermissionFlags.ADMINISTRATOR, true),
			"Bitfield:",
			member.permissions.bitfield.toString(2)
		);
	}
});

bot.commands.add(cmd);

bot.connect(Deno.env.get("token")!, [
	// All intents to make sure it's not an intent issue
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MEMBERS,
	GatewayIntents.GUILD_MODERATION,
	GatewayIntents.GUILD_EMOJIS_AND_STICKERS,
	GatewayIntents.GUILD_INTEGRATIONS,
	GatewayIntents.GUILD_WEBHOOKS,
	GatewayIntents.GUILD_INVITES,
	GatewayIntents.GUILD_VOICE_STATES,
	GatewayIntents.GUILD_PRESENCES,
	GatewayIntents.GUILD_MESSAGES,
	GatewayIntents.GUILD_MESSAGE_REACTIONS,
	GatewayIntents.GUILD_MESSAGE_TYPING,
	GatewayIntents.DIRECT_MESSAGES,
	GatewayIntents.DIRECT_MESSAGE_REACTIONS,
	GatewayIntents.DIRECT_MESSAGE_TYPING,
	GatewayIntents.MESSAGE_CONTENT,
]);
