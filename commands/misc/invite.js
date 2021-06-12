const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "invite",
  alts: [],
  description: "Bot invite"
};

exports.run = async function(bot, msg, args, prefix) {
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot Invite")
      .setDescription(
        "Add the bot to your server [**here**](https://discord.com/api/oauth2/authorize?client_id=778670182956531773&permissions=8&scope=bot)."
      )
  );
};
