const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
var musicqueue = require("./play.js").musicqueue;
const ytdl = require("ytdl-core");
exports.info = {
  name: "nowplaying",
  alts: ["np"],
  description: "Get current song being played"
};

exports.run = async function(bot, msg, args, prefix) {
  let musicqu = musicqueue.get(msg.guild.id);
  if (
    musicqueue.get(msg.guild.id) == null ||
    musicqueue.get(msg.guild.id) == undefined
  )
    return msg.channel.send("I am not currently playing anything!");
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription(
        "**Now playing: ** `" +
          (await ytdl.getBasicInfo(musicqu.songs[0])).videoDetails.title +
          "`"
      )
      .setFooter("Total songs queued: " + musicqu.songs.length)
  );
};
