const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
const fs = require("fs");
exports.info = {
  name: "mhmeme",
  alts: ["minehutmeme"],
  description: "Get a dank mh meme",
}

const memes = fs.readFileSync("./assets/memes/mhmemes.txt", "utf8").split("\n")

exports.run = async function (bot, msg, args, prefix) {
  msg.channel.send(
    new discord.MessageEmbed().setTitle("Minehut meme").setDescription("Enjoy!").setImage(memes[Math.floor(Math.random() * memes.length)]).setFooter("Adxm#7477 made me")
  )
};
