const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
var musicqueue = require("./play.js").musicqueue;
const ytdl = require("ytdl-core");
exports.info = {
  name: "queue",
  alts: ["q"],
  description: "Music queue",
};

exports.run = async function (bot, msg, args, prefix) {
  let musicq = musicqueue.get(msg.guild.id);
  if (musicq == null || musicq == undefined)
    return msg.channel.send("I am not currently playing anything!");
  let maxsongs = 10;
  if (musicq.songs.length < maxsongs) maxsongs = musicq.songs.length;
  let desc = "";
  for (let i = 1; i < maxsongs; i++) {
    console.log(i)
    let songinfo = await ytdl.getBasicInfo(musicq.songs[i]);
    desc = desc + "**[" + i + "]** - `" + songinfo.videoDetails.title + "` \n";
  }
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription(
        "**Now playing: **\n- `" +
          (await ytdl.getBasicInfo(musicq.songs[0])).videoDetails.title +
          "`" +
          "\n **Next:** \n" +
          desc
      )
      .setFooter("Total songs queued: " + musicq.songs.length)
  );
};
