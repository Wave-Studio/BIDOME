import { Command, CommandContext, Embed } from "harmony";
import { loopFilesAndReturn } from "tools";

export default class Load extends Command {
	name = "load";
	aliases = ["loadcommand", "loadcmd"];
	description = "Load a specific command file";
	category = "dev";
	usage = "load <file>";
	ownerOnly = true;
	async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Loader",
						description: "You need to provide a command!",
					}).setColor("red"),
				],
			});
		} else {
			const message = await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Loader",
						description: "Loading...",
					}).setColor("random"),
				],
			});

			let didFindCommand = false;

			const commandFiles = await loopFilesAndReturn("./commands/");
			for (const file of commandFiles) {
				const cmdName = file
					.toLowerCase()
					.substring(file.lastIndexOf("/") + 1, file.lastIndexOf("."));
				const importFilePath = `../.${file}#${Math.random()
					.toString()
					.substring(2)}`;
				if (cmdName == ctx.argString.toLowerCase()) {
					didFindCommand = true;
					const imported = (await import(importFilePath)).default;
					ctx.client.commands.add(imported);
					break;
				}
			}

			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Reloaded",
						description: didFindCommand
							? "File has been loaded"
							: "File not found",
					}).setColor(didFindCommand ? "random" : "red"),
				],
			});
		}
	}
}
