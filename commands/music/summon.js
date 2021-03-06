const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "summon",
  alts: ["join"],
  description: "Summon the bot to your channel",
};

exports.run = async function (bot, msg, args, prefix) {
  let vc = msg.member.voice.channel;
  if (!vc)
    return msg.channel.send(
      "You are not currently connected to a voice channel!"
    );
  if (msg.guild.me.voice.channel) {
    if (
      msg.guild.me.voice.channel.members.filter((m) => !m.user.bot).size > 0 &&
      msg.member.voice.channel.id !== msg.guild.me.voice.channel.id &&
      !msg.member.hasPermission("ADMINISTRATOR") &&
      botdevs.includes(msg.author.id)
    )
      return msg.channel.send("I am currently connected to another channel!");
  }
  msg.member.voice.channel.join();
}