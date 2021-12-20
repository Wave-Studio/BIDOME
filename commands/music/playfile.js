const botdevs = ["423258218035150849", "314166178144583682"];
const discord = require("discord.js");
const https = require("https");
const fs = require("fs");
exports.info = {
	name: "playfile",
	alts: ["pf"],
	description: "Dev only",
};

exports.run = async function(bot, msg, args, prefix) {
	return msg.channel.send("Hey, there's a new music system being tested in Bidome! Access it by replacing my prefix with <@778670182956531773>");
	if (
		!botdevs.includes(msg.author.id) &&
		!msg.member.hasPermission("ADMINISTRATOR")
	) {
		return msg.channel.send(
			"Sorry but this feature is dev only at the moment!"
		);
	}
	if (!args[1]) return msg.channel.send("Please provide a file URL!");
	const vc = await msg.member.voice.channel
	const connection = await vc.join();
	const date = Date.now();
	var file = await fs.createWriteStream(`./audio/${date}.wav`);
	const response = await https.get(args[1], async function(response) {
		await response.pipe(file);
		response.on("end", async () => {
			const dispatcher = connection.play(`./audio/${date}.wav`);
			const message = await msg.channel.send("Playing file!");
			dispatcher.on("finish", () => {
				fs.unlinkSync(`./audio/${date}.wav`);
				message.edit("Song has finished playing!");
				vc.leave();
			});
		});
	});
};
