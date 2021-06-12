const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "serverinfo",
  alts: [],
  description: "Server info"
};

exports.run = async function(bot, msg, args, prefix) {
  msg.channel.send(
    new discord.MessageEmbed().setTitle("Bidome bot server info").addFields(
      { name: "Accounts", value: msg.guild.memberCount, inline: true },
      {
        name: "Humans",
        value: msg.guild.members.cache.filter(member => !member.user.bot).size,
        inline: true
      },
      {
        name: "Bots",
        value: msg.guild.members.cache.filter(member => member.user.bot).size,
        inline: true
      },
      {
        name: "Channels",
        value: msg.guild.channels.cache.size,
        inline: true
      },
      { name: "Owner", value: msg.guild.owner.user.tag, inline: true },
      { name: "Roles", value: msg.guild.roles.cache.size, inline: true }
    )
  );
};
