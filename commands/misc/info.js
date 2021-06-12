const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "info",
  alts: [],
  description: "Bot info"
};

exports.run = async function(bot, msg, args, prefix) {
  let rolesfromeachserver = 0;
  await bot.guilds.cache.forEach(g => {
    rolesfromeachserver = rolesfromeachserver + g.roles.cache.size;
  });
  msg.channel.send(
    new discord.MessageEmbed().setTitle("Bidome bot info").addFields(
      { name: "Accounts", value: bot.users.cache.size, inline: true },
      {
        name: "Humans",
        value: bot.users.cache.filter(member => !member.bot).size,
        inline: true
      },
      {
        name: "Bots",
        value: bot.users.cache.filter(member => member.bot).size,
        inline: true
      },
      { name: "Channels", value: bot.channels.cache.size, inline: true },
      { name: "Servers", value: bot.guilds.cache.size, inline: true },
      { name: "Roles", value: rolesfromeachserver, inline: true }
    )
  );
};
