const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
var musicqueue = require("./play.js").musicqueue;
const ytdl = require("ytdl-core");
const playMusic = require("./play.js").playMusic
exports.info = {
  name: "skip",
  alts: ["s"],
  description: "Skip current song",
};

exports.run = async function (bot, msg, args, prefix) {
  let queuedsongs = musicqueue.get(msg.guild.id);
  if (queuedsongs == null || queuedsongs == undefined)
    return msg.channel.send("I am not currently playing anything!");
  if (
    msg.guild.me.voice.channel.members.filter((m) => !m.user.bot).size > 0 &&
    !msg.member.hasPermission("ADMINISTRATOR") && !botdevs.includes(msg.author.id)
  )
    return msg.channel.send("Voting to skip 1/idfk (im too lazy to kode this rn)!");
  queuedsongs.songs.splice(0, 1);
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription("I have skipped the song")
  );

  if (queuedsongs.songs.length > 0)
    return playMusic(msg.member.voice.channel, msg);
  msg.member.voice.channel.leave();
  musicqueue.delete(msg.guild.id);
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription("I have finished my queue and have left the channel")
  );
};
