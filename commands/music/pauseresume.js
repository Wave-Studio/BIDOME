const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
var musicqueue = require("./play.js").musicqueue;
const ytdl = require("ytdl-core");
exports.info = {
  name: "pause",
  alts: ["resume"],
  description: "Pause/resume the song",
};

exports.run = async function (bot, msg, args, prefix) {
  if (!msg.guild.me.voice.channel)
    return msg.channel.send("I am not currently connected to a voice channel!");
  if (
    msg.guild.me.voice.channel.members.filter((m) => !m.user.bot).size > 0 &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id &&
    !msg.member.hasPermission("ADMINISTRATOR")
  )
    return msg.channel.send(
      "You don't have permission to pause/play at this time, being alone with the bot works."
    );
  let isconnected = musicqueue.get(msg.guild.id);
  if (isconnected.paused[0]) {
    msg.channel.send("The player is no longer paused");
    isconnected.dispatcher[0].resume();
    isconnected.paused.splice(0, 1, false);
  } else {
    msg.channel.send("I have paused the player");
    isconnected.dispatcher[0].pause();
    isconnected.paused.splice(0, 1, true);
  }
};
