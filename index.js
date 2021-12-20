const discord = require("discord.js");
const bot = new discord.Client({
	partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
});
const fs = require("fs");
const prefix = "!";
const status = require("./status.js");
const Database = require("@replit/database");
const ytdl = require("ytdl-core");
const ytapi = require("simple-youtube-api");
const opus = require("@discordjs/opus");
const db = new Database();
const botdevs = ["423258218035150849", "314166178144583682"];
var commands = new Map();
var cooldown = new Map();

const http = require("http");
const express = require("express");
const app = express();
{
	app.get("/*", (request, response) => {
		if (request.path === "/styles.css")
			return response.send(fs.readFileSync("assets/styles.css", "utf8"));
		response.send(fs.readFileSync("assets/home.html", "utf8")); // sends http status "OK"
	});
	app.listen(process.env.PORT);
	setInterval(() => {
		http.get(`http://Bidome.luseufert5.repl.co/`);
	}, 280000);
}
fs.rmdirSync("./audio", { recursive: true });
fs.mkdirSync("./audio");

fs.readdir("./commands/", async (err, files) => {
	let dirs = files.filter(f => !f.includes("."));
	await dirs.forEach(async f => {
		await fs.readdir("./commands/" + f + "/", async (err, files) => {
			let jsf = files.filter(fi => fi.endsWith(".js"));
			await jsf.forEach(async cmd => {
				try {
					commands.set(
						require("./commands/" + f + "/" + cmd).info.name,
						"./commands/" + f + "/" + cmd
					);
					let alts = require("./commands/" + f + "/" + cmd).info.alts;
					alts.forEach(a => {
						commands.set(a, "./commands/" + f + "/" + cmd);
					});
				} catch { }
			});
		});
	});
});

bot.on("voiceStateUpdate", async (oldState, newState) => {
	try {
		if (oldState.channel !== null && newState.channel === null) {
			if (newState.member.id === bot.user.id) {
				if (
					!require("./commands/music/play.js").musicqueue.has(newState.guild.id)
				)
					return;
				await require("./commands/music/play.js")
					.musicqueue.get(newState.guild.id)
					.dispatcher[0].destroy();
				require("./commands/music/play.js").musicqueue.delete(
					newState.guild.id
				);
			}
		}
	} catch { }
});

bot.on("ready", async () => {
	process.env.supersecretthingthatnobodyshouldknow =
		"pls visit this site: [Here](https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL45I7czocaVJmE4FQrV4r6R5SL47hIs-O&index=92) cause im too lazy to paste the stuff";
	console.log("Bidome bot");
	console.log("Starting loading . . .");
	console.log("Loaded " + commands.size + " commands");
	console.log("Registering commands in " + bot.guilds.cache.size + " servers");
	console.log("Loading DB");
	bot.user.setPresence({
		status: "idle",
		activity: { name: "Bidome bot start up | !help", type: "WATCHING" }
	});
	console.log("Bot started");
	setInterval(async function() {
		let statuses = status.status();
		bot.user.setPresence({
			status: "idle",
			activity: {
				name: await Placeholders(
					statuses[Math.floor(Math.random() * statuses.length)]
				),
				type: "WATCHING"
			}
		});
	}, 30000);
});

async function Placeholders(status) {
	status = status.replace(/{servers}/, bot.guilds.cache.size + "");
	return status;
}

bot.on("guildCreate", async guild => {
	let p = await db.get("prefix." + guild.id);
	if (p == null || p == undefined) {
		p = prefix;
		db.set("prefix." + guild.id, prefix);
	}
});

bot.on("message", async msg => {
	if (msg.author.bot) return;
	if (msg.content.toLowerCase().includes(":bidome:"))
		msg.react("776908944240541706");
	if (msg.channel.type === "dm") {
		if (!msg.content.toLowerCase().startsWith("!verify")) return;
		if (
			bot.guilds.cache
				.get("763454459208400897")
				.members.cache.has(msg.author.id)
		) {
			if (
				bot.guilds.cache
					.get("763454459208400897")
					.members.cache.get(msg.author.id)
					.roles.cache.has("779045873987616788")
			) {
				msg.channel.send(
					"You have already gotten the bidome bot support role!"
				);
			} else {
				bot.guilds.cache
					.get("763454459208400897")
					.members.cache.get(msg.author.id)
					.roles.add("779045873987616788");
				msg.channel.send("You have now received the bidome bot support role");
			}
			return;
		} else {
			return;
		}
	}
	let p = await db.get("prefix." + msg.guild.id);
	if (p == null || p == undefined) {
		p = prefix;
		db.set("prefix." + msg.guild.id, prefix);
	}
	if (
		msg.content === "<@" + bot.user.id + ">" ||
		msg.content === "<@!" + bot.user.id + ">"
	) {
		if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return;
		return msg.channel.send("My current prefix in this server is `" + p + "`");
	}
	if (!msg.content.toLowerCase().startsWith(p.toLowerCase())) return;
	let args = msg.content.toString().split(" ");
	if (
		!commands.has(
			msg.content
				.toLowerCase()
				.split(" ")[0]
				.substring(p.length)
		)
	)
		return;
	if (cooldown.has(msg.author.id)) {
		msg.channel.send(new discord.MessageEmbed().setTitle("Slow down!").setDescription("Please wait `" + (5 - ((Date.now() - cooldown.get(msg.author.id)) / 1000)).toFixed(1) + "` second(s) before running another command!"))
		return;
	}
	if (!botdevs.includes(msg.author.id) && !msg.member.hasPermission("ADMINISTRATOR")) {
		cooldown.set(msg.author.id, Date.now())
		setTimeout(() => {
			cooldown.delete(msg.author.id)
		}, 5 * 1000)
	}
	
	await require(commands.get(args[0].toLowerCase().substring(p.length))).run(
		bot,
		msg,
		args,
		p
	);
});

bot.on("message", async msg => {
	if (msg.channel.type === "dm") return;
	if (msg.channel.id !== "754104963210149959") return;
	if (
		msg.author.id === "331179093447933963" &&
		msg.content.toLowerCase().includes("server")
	)
		return msg.react("⛔");
	await msg.react("<:yes:760606436777656391>");
	await msg.react("<:no:760606447666069604>");
});

bot.on("message", async msg => {
	if (msg.channel.id !== "839181518228291624") return;
	await msg.react("<:yes:760606436777656391>");
	await msg.react("<:no:760606447666069604>");
});

require("process").on('uncaughtException', (err, origin) => {
	console.log("An error has occured! Below is the stacktrace");
	console.log(err);
});

bot.on("error", (err) => {
	console.log("An error has occured: ", err);
})


bot.login(process.env.supersecretthingthatnobodyshouldknow);