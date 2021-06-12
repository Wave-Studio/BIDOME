const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "ping",
  alts: [],
  description: "Ping pong"
};

exports.run = async function(bot, msg, args, prefix) {
  let m = await msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot ping")
      .setDescription("Getting ping!")
  );
  m.edit(
    new discord.MessageEmbed()
      .setTitle("Bidome bot ping")
      .setDescription("🏓")
      .addField(
        "Current ping",
        "**Ping:** `" +
          (Date.now() - msg.createdTimestamp) +
          "`ms \n**Websocket ping**: `" +
          Math.round(bot.ws.ping) +
          "`ms"
      )
  );
};
