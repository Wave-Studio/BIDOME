const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
var musicqueue = new Map();
exports.musicqueue = musicqueue;
const ytapi = require("simple-youtube-api");
const ytdl = require("ytdl-core");
exports.info = {
  name: "play",
  alts: ["p"],
  description: "Play a song",
};

const ytapikeys = [
  process.env.ytapikey1,
  process.env.ytapikey2,
  process.env.ytapikey3,
  process.env.ytapikey4,
  process.env.ytapikey5,
];

exports.run = async function (bot, msg, args, prefix) {
  const youtube = new ytapi(
    ytapikeys[Math.floor(Math.random() * ytapikeys.length)]
  );
  if (msg.guild.me.voice.channel) {
    if (
      msg.guild.me.voice.channel.members.filter((m) => !m.user.bot).size > 0 &&
      msg.member.voice.channel.id !== msg.guild.me.voice.channel.id &&
      !msg.member.hasPermission("ADMINISTRATOR")
    )
      return msg.channel.send("I am currently connected to another channel!");
  }
  let vc = msg.member.voice.channel;
  if (!vc)
    return msg.channel.send(
      "You are not currently connected to a voice channel!"
    );
  if (!args[1]) return msg.channel.send("You have not provided a song!");
  let q = musicqueue.get(msg.guild.id);
  let song = args[1];
  let searchmsg = await msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription("<a:typing:779775412829028373> Searching for `"+msg.content.substring(args[0].length + 1)+"`")
  );
  try{(
      await youtube.searchVideos(msg.content.substring(args[0].length + 1))
    )[0].url;}catch{return searchmsg.edit(new discord.MessageEmbed().setTitle("Bidome bot music").setDescription("I couldn't find a song with that name!"))}
  if (
    !song.startsWith("http://youtube.com") &&
    !song.startsWith("https://youtube.com") &&
    !song.startsWith("http://www.youtube.com") &&
    !song.startsWith("https://www.youtube.com") &&
    !song.startsWith("http://youtu.be") &&
    !song.startsWith("https://youtu.be") &&
    !song.startsWith("http://www.youtu.be") &&
    !song.startsWith("https://www.youtu.be")
  )
    song = (
      await youtube.searchVideos(msg.content.substring(args[0].length + 1))
    )[0].url;
  let info = await ytdl.getBasicInfo(song);
  if (q == null || q == undefined)
    musicqueue.set(msg.guild.id, {
      songs: [],
      dispatcher: [],
      paused: [false],
    });
  q = musicqueue.get(msg.guild.id);
  q.songs.push(song);
  if (q.songs.length < 2) return playMusic(vc, msg, searchmsg);
  searchmsg.edit(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription("Added song `" + info.videoDetails.title + "` to queue")
  );
};

async function playMusic(vc, msg, deletme = null) {
  let q = musicqueue.get(msg.guild.id);
  let connection = await vc.join();
  let song = await ytdl(q.songs[0], { filter: "audioonly" });
  let info = await ytdl.getBasicInfo(q.songs[0]);
  if(deletme) deletme.edit(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription("Started playing `" + info.videoDetails.title + "`")
      .setThumbnail(info.videoDetails.thumbnail.thumbnails[0].url)
  );
  else
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot music")
      .setDescription("Started playing `" + info.videoDetails.title + "`")
      .setThumbnail(info.videoDetails.thumbnail.thumbnails[0].url)
  );

  let dispatcher = connection.play(song);
  q.dispatcher.splice(0, 1, dispatcher);
  dispatcher.on("finish", () => {
    q.songs.splice(0, 1);
    if (q.songs.length > 0) return playMusic(vc, msg, deletme);
    if (!msg.guild.me.voice.channel) return;
    vc.leave();
    musicqueue.delete(msg.guild.id);
    if(deletme) deletme.edit(
      new discord.MessageEmbed()
        .setTitle("Bidome bot music")
        .setDescription("I have finished my queue and have left the channel")
    )
    else
    msg.channel.send(
      new discord.MessageEmbed()
        .setTitle("Bidome bot music")
        .setDescription("I have finished my queue and have left the channel")
    );
  });
} exports.playMusic = playMusic;