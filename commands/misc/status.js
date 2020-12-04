const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "status",
  alts: [],
  description: "Bot statuses",
};

exports.run = async function (bot, msg, args, prefix) {
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("Bidome bot statuses")
      .setDescription(
        "You can suggest statuses to be added to bidome bot [**Here**](https://github.com/LukasmanMHdude/BIDOME)"
      )
  );
};
