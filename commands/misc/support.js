const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "support",
  alts: [],
  description: "Command description",
};

exports.run = async function (bot, msg, args, prefix) {
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot Support")
      .setDescription(
        "Get bot support [**here**](https://discord.gg/Y4USEwV) by joining this server and dming me."
      )
  );
};
