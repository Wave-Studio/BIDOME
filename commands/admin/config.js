const Database = require("@replit/database");
const db = new Database();
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "config",
  alts: ["setting", "configs", "settings"],
  description: "Configure bot"
};

exports.run = async function(bot, msg, args, prefix) {
  if (
    !msg.member.hasPermission("ADMINISTRATOR") &&
    !botdevs.includes(msg.author.id)
  )
    return;
  if (!args[1])
    return msg.channel.send(
      new discord.MessageEmbed()
        .setTitle("Bidome bot configuration")
        .addField("Options", "`prefix`")
    );
  switch (args[1].toLowerCase()) {
    case "prefix":
      if (!args[2])
        return msg.channel.send(
          new discord.MessageEmbed()
            .setTitle("Bidome bot configuration")
            .addField(
              "Current prefix",
              "The current prefix is set to `" + prefix + "`"
            )
        );
      if (args[2].length > 3 || args[2].includes("`") || args[2].includes("*"))
        return msg.channel.send(
          new discord.MessageEmbed()
            .setTitle("Bidome bot configuration")
            .addField(
              "Prefix configuration",
              "Sorry but prefixes are currently limited to 3 characters and cannot use characters like **`** and **\\***"
            )
        );
      db.set("prefix." + msg.guild.id, args[2].toLowerCase());
      return msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("Bidome bot configuration")
          .addField(
            "Current prefix",
            "Changed the prefix to `" + args[2].toLowerCase() + "`"
          )
      );
      break;
    default:
      msg.channel.send(
        new discord.MessageEmbed()
          .setTitle("Bidome bot configuration")
          .setDescription(
            "I couldn't find that option! Use `" +
              prefix +
              "help admin` for more commands."
          )
      );
      break;
  }
};
