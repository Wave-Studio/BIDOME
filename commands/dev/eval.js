const botdevs = require("../../config.json").devs;
const discord = require("discord.js");
// Put this file in `commands/type/file.js`
exports.info = {
  name: "eval",
  alts: [],
  description: "Execute code",
};

exports.run = async function (bot, msg, args, prefix) {
  if(!botdevs.includes(msg.author.id)) return;
  let evcode = msg.content.toString().substring(args[0].length + 1);
  try{
  let ev = await eval(evcode);
  let clean = await require("util").inspect(ev)
  console.log(clean)
    msg.channel.send("Executed with output: ```"+clean+"```")
    msg.react("☑️")
  }catch(e){
    console.log(e)
    msg.channel.send("Errored with output: ```"+e+"```")
  }
}