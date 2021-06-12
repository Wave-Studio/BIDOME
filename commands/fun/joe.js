const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "joe",
  alts: [],
  description: "Get joe bidomed"
};

exports.run = async function(bot, msg, args, prefix) {
  msg.channel.send(
    new discord.MessageEmbed()
      .setTitle("BIDOME")
      .setDescription("<:joebidome:776908944240541706> Get Joe bidomed")
  );
  msg.react("776908944240541706");
};
