const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
const https = require("https");
const fs = require("fs");
exports.info = {
  name: "playfile",
  alts: ["pf"],
  description: "Dev only",
};

exports.run = async function (bot, msg, args, prefix) {
  if (!botdevs.includes(msg.author.id)) {
    return msg.channel.send(
      "Sorry but this feature is dev only at the moment!"
    );
  }
  if (!args[1]) return msg.channel.send("Please provide a file URL!");
  const connection = await msg.member.voice.channel.join();
  const date = Date.now();
  var file = await fs.createWriteStream(`./audio/${date}.wav`);
  const response = await https.get(args[1], async function (response) {
    await response.pipe(file);
    response.on("end", () => {
      connection.play(`./audio/${date}.wav`);
    });
  });
};
