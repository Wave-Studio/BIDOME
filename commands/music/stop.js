const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
var musicqueue = require("./play.js").musicqueue;
const ytdl = require("ytdl-core");
exports.info = {
  name: "stop",
  alts: ["dc", "disconnect", "fuckoff"],
  description: "Stop playing music"
};

exports.run = async function(bot, msg, args, prefix) {
  if (!msg.guild.me.voice.channel)
    return msg.channel.send("I am not currently connected to a voice channel!");
  if (
    msg.guild.me.voice.channel.members.filter(m => !m.user.bot).size > 1 &&
    !msg.member.hasPermission("ADMINISTRATOR") &&
    !botdevs.includes(msg.author.id)
  )
    return msg.channel.send("There are currently users using me!");
  msg.guild.me.voice.channel.leave();
  musicqueue.get(msg.guild.id).dispatcher[0].destroy();
  msg.channel.send("I have left the voice channel!");
  musicqueue.delete(msg.guild.id);
};
