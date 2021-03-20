const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "help",
  alts: [],
  description: "Provide help messages",
};

exports.run = async function (bot, msg, args, prefix) {
  if (!args[1])
    return msg.channel.send(
      new discord.MessageEmbed()
        .setTitle("BIDOME BOT HELP")
        .addField("**🐵 Fun**", "`Fun commands to` \n`pass the time.`")
        .addField(
          "**🎭 Misc**",
          "`General commands that` \n`don't fit elsewhere.`"
        )
        .addField("**🎵 Music**", "`Listen to jams` \n`on discord`")
        .addField("**👮‍♂️ Admin**", "`Admin commands` \n`and configs.`")
        .setAuthor(
          "Use " + prefix + "help <fun/admin/misc/music> to view commands!"
        )
    );
  switch (args[1].toLowerCase()) {
    case "fun":
      return msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("BIDOME BOT HELP")
          .addField("⮞ **Commands [1]:**", "`joe`\n`mhmeme`")
      );
      break;
    case "admin":
      return msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("BIDOME BOT HELP")
          .addField("⮞ **Commands [1]:**", "`config`")
      );
      break;
    case "misc":
      return msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("BIDOME BOT HELP")
          .addField(
            "⮞ **Commands [5]:**",
            "`ping` \n`invite` \n`support` \n`info` \n`status` \n`serverinfo`"
          )
      );
      break;
    case "music":
      return msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("BIDOME BOT HELP")
          .addField(
            "⮞ **Commands [7]:**",
            "`play` \n`pause` \n`resume` \n`queue` \n`nowplaying` \n`disconnect` \n`skip`"
          )
      );
      break;
    default:
      msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("BIDOME BOT HELP")
          .setDescription(
            "I couldn't find that category! See my categories at `" +
              prefix +
              "help`"
          )
      );
      break;
  }
};
