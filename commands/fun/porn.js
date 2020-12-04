const db = new require("@replit/database");
const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
exports.info = {
  name: "porn",
  alts: [],
  description: "😉",
};

const pvideos = [
  "../../assets/pvideos/vid1.mp4",
  "../../assets/pvideos/vid2.mp4",
  "../../assets/pvideos/vid3.mp4",
  "../../assets/pvideos/vid4.mp4",
  "../../assets/pvideos/vid5.mp4",
];

exports.run = async function (bot, msg, args, prefix) {
  msg.channel.send("*Enjoy*  😉", {
    files: [
      {
        attachment: pvideos[Math.floor(Math.random() * pvideos.length)],
        name: "SPOILER_porn.mp4",
      },
    ],
  });
};
