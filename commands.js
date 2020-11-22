const discord = require("discord.js");
const fs = require("fs");
const Database = require("@replit/database")
const botdevs = ["423258218035150849", "314166178144583682"]
const ytdl = require("ytdl-core")
const opus = require("@discordjs/opus")
var musicqueue = new Map();

const pvideos = ["./assets/pvideos/vid1.mp4", "./assets/pvideos/vid2.mp4", "./assets/pvideos/vid3.mp4", "./assets/pvideos/vid4.mp4", "./assets/pvideos/vid5.mp4"]

async function commands(msg, bot, command, db, prefix) {
  const args = msg.content.toString().split(" ");
  const msgprefix = await db.get("prefix." + msg.guild.id)
  switch (command) {
    /*--------
    Help
    --------*/
    case "help":
      if (!args[1]) return msg.channel.send(new discord.MessageEmbed().setTitle("BIDOME BOT HELP").addField("**🐵 Fun**", "\`Fun commands to\` \n\`pass the time.\`").addField("**🎭 Misc**", "\`General commands that\` \n\`don't fit elsewhere.\`").addField("**👮‍♂️ Admin**", "\`Admin commands\` \n\`and configs.\`").setAuthor("Use " + msgprefix + "help <fun/admin/misc> to view commands!"))
      switch (args[1].toLowerCase()) {
        case "fun":
          return msg.channel.send(new discord.MessageEmbed().setTitle("BIDOME BOT HELP").addField("⮞ **Commands [1]:**", "`joe`"))
          break;
        case "admin":
          return msg.channel.send(new discord.MessageEmbed().setTitle("BIDOME BOT HELP").addField("⮞ **Commands [1]:**", "\`prefix\` \n \n*Make sure to use \`" + msgprefix + "config <arg>\` in your messages!*"))
          break;
        case "misc":
          return msg.channel.send(new discord.MessageEmbed().setTitle("BIDOME BOT HELP").addField("⮞ **Commands [3]:**", "`ping` \n`invite` \n`support` \n`info` \n`status`"))
          break;
        default:
          msg.channel.send(new discord.MessageEmbed().setTitle("BIDOME BOT HELP").setDescription("I couldn't find that category! See my categories at `" + msgprefix + "help`"))
          break;
      }
      break;
    /*--------
    Misc
    --------*/
    case "ping":
      let m = await msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot ping").setDescription("Getting ping!"))
      m.edit(new discord.MessageEmbed().setTitle("Bidome bot ping").setDescription("🏓").addField("Current ping", "**Ping:** `" + (Date.now() - msg.createdTimestamp) + "`ms \n**Websocket ping**: `" + Math.round(bot.ws.ping) + "`ms"))
      break;
    case "invite":
      msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot Invite").setDescription("Add the bot to your server [**here**](https://discord.com/api/oauth2/authorize?client_id=778670182956531773&permissions=8&scope=bot)."))
      break;
    case "support":
      msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot Support").setDescription("Get bot support [**here**](https://discord.gg/Y4USEwV) by joining this server and dming me."))
      break;
    case "info":
      let rolesfromeachserver = 0;
      await bot.guilds.cache.forEach(g => {
        rolesfromeachserver = rolesfromeachserver + g.roles.cache.size;
      })
      msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot info").addFields(
        { name: "Accounts", value: bot.users.cache.size, inline: true },
        { name: "Humans", value: bot.users.cache.filter(member => !member.bot).size, inline: true },
        { name: "Bots", value: bot.users.cache.filter(member => member.bot).size, inline: true },
        { name: "Channels", value: bot.channels.cache.size, inline: true },
        { name: "Servers", value: bot.guilds.cache.size, inline: true },
        { name: "Roles", value: rolesfromeachserver, inline: true }
      ))
    break;
    case "status":
      msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot statuses").setDescription("You can suggest statuses to be added to bidome bot [**Here**](https://github.com/LukasmanMHdude/BIDOME)"))
    break;
    case "serverinfo":
      msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot server info").addFields(
        { name: "Accounts", value: msg.guild.memberCount, inline: true },
        { name: "Humans", value: msg.guild.members.cache.filter(member => !member.user.bot).size, inline: true },
        { name: "Bots", value: msg.guild.members.cache.filter(member => member.user.bot).size, inline: true },
        { name: "Channels", value: msg.guild.channels.cache.size, inline: true },
        { name: "Owner", value: msg.guild.owner.user.tag, inline: true },
        { name: "Roles", value: msg.guild.roles.cache.size, inline: true }
      ))
    break;
    /*--------
    Admin
    --------*/
    case "config":
      if (!msg.member.hasPermission("ADMINISTRATOR") && !botdevs.includes(msg.author.id)) return;
      if (!args[1]) return msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot configuration").addField("Options", "`prefix`"))
      switch (args[1].toLowerCase()) {
        case "prefix":
          if (!args[2]) return msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot configuration").addField("Current prefix", "The current prefix is set to `" + msgprefix + "`"))
          if (args[2].length > 3 || args[2].includes("`") || args[2].includes("*")) return msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot configuration").addField("Prefix configuration", "Sorry but prefixes are currently limited to 3 characters and cannot use characters like **`** and **\\***"))
          db.set("prefix." + msg.guild.id, args[2].toLowerCase());
          return msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot configuration").addField("Current prefix", "Changed the prefix to `" + args[2].toLowerCase() + "`"))
          break;
        default:
          msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot configuration").setDescription("I couldn't find that option! Use \`" + msgprefix + "help admin\` for more commands."))
          break;
      }
      break;
    /*--------
    Fun
    --------*/
    case "joe":
      msg.channel.send(new discord.MessageEmbed().setTitle("BIDOME").setDescription("<:joebidome:776908944240541706> Get Joe bidomed"))
      msg.react("776908944240541706")
      break;
    case "porn":
      msg.channel.send("*Enjoy*  😉", { files: [{ attachment: pvideos[Math.floor(Math.random() * pvideos.length)], name: "SPOILER_porn.mp4" }] })
      break;
    /*--------
    Music
    --------*/
    case "play":
      let vc = msg.member.voice.channel;
      if(!vc) return msg.channel.send("You are not currently connected to a voice channel!")
      if(!args[1]) return msg.channel.send("You have not provided a song!");
      let q = musicqueue.get(msg.guild.id)
      let song = args[1]
      if(q == null || q == undefined) musicqueue.set(msg.guild.id, {"songs":[], "dispatcher":[]})
      q = musicqueue.get(msg.guild.id)
      q.songs.push(song);
      if(q.songs.length < 2) return playMusic(vc, msg);
      let info = await ytdl.getBasicInfo(song)
      msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot music").setDescription("Added song `"+info.videoDetails.title+"` to queue"))
    break;
  }
} exports.commands = commands

async function playMusic(vc, msg){
  let q = musicqueue.get(msg.guild.id)
  let connection = await vc.join();
  let song = await ytdl(q.songs[0], { filter: 'audioonly' })
  let info = await ytdl.getBasicInfo(q.songs[0])

  msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot music").setDescription("Started playing `"+info.videoDetails.title+"`").setThumbnail(info.videoDetails.thumbnail.thumbnails[0].url))

  let dispatcher = connection.play(song);
  q.dispatcher.splice(0, 1, dispatcher)
  dispatcher.on('finish', () =>{
    q.songs.splice(0, 1);
    if(q.songs.length > 0) return playMusic(vc, msg);
    vc.leave();
    musicqueue.delete(msg.guild.id)
    msg.channel.send(new discord.MessageEmbed().setTitle("Bidome bot music").setDescription("I have finished my queue and have left the channel"))
  })
}