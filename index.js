const discord = require("discord.js");
const bot = new discord.Client();
const fs = require("fs");
const prefix = "!";
const commandmanager = require("./commands.js");
const status = require("./status.js");
const Database = require("@replit/database");
const ytdl = require("ytdl-core");
const opus = require("@discordjs/opus");
const db = new Database();

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

bot.on("ready", async () => {
  console.log("Bot loaded");
  bot.user.setPresence({
    status: "idle",
    activity: { name: "Bidome bot wake up", type: "WATCHING" },
  });
  setInterval(function () {
    let statuses = status.status();
    bot.user.setPresence({
      status: "idle",
      activity: {
        name: statuses[Math.floor(Math.random() * statuses.length)],
        type: "WATCHING",
      },
    });
  }, 30000);
});

bot.on("guildCreate", async (guild) => {
  let p = await db.get("prefix." + guild.id);
  if (p == null || p == undefined) {
    p = prefix;
    db.set("prefix." + guild.id, prefix);
  }
});

bot.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content.toLowerCase().includes("bidome"))
    msg.react("776908944240541706");
  if (msg.channel.type === "dm") {
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
  const args = msg.content.toString().split(" ");
  const command = args[0].toLowerCase().substring(p.length);
  await commandmanager.commands(msg, bot, command, db, p);
});

bot.login(process.env.TOKEN);
