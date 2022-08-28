import { Command, CommandContext, Embed } from "harmony";
import { loopFilesAndReturn } from "tools";

export default class Reload extends Command {
	name = "reload";
	aliases = ["rl", "reloadcommand", "rlcmd", "reloadcmd", "rlcommand"];
	description = "Reload a specific command";
	category = "dev";
	usage = "reload <command>";
	ownerOnly = true;
	async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome Reload",
					description: "You need to provide a command!",
				}).setColor("red")],
			});
		} else {
			const command = ctx.client.commands.find(ctx.argString);
			if (command == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Reload",
						description: "Unknown command!",
					}).setColor("red")],
				});
			} else {
				const message = await ctx.message.reply(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Reload",
						description: "Reloading...",
					}).setColor("random")],
				});

				ctx.client.commands.delete(command.name);

				if (command.aliases != undefined) {
					if (typeof command.aliases == "string") {
						ctx.client.commands.delete(command.aliases);
					} else {
						for (const alias of command.aliases) {
							ctx.client.commands.delete(alias);
						}
					}
				}

				let didFindCommand = false;

				const commandFiles = await loopFilesAndReturn("./commands/");
				for (const file of commandFiles) {	
					const cmdName = file.toLowerCase().substring(file.lastIndexOf("/") + 1, file.lastIndexOf("."));
					const importFilePath = `../.${file}#${Math.random().toString().substring(2)}`
					if (cmdName == command.name.toLowerCase()) {
						didFindCommand = true;
						const imported = (await import(importFilePath)).default;
						ctx.client.commands.add(imported);
						break;
					}
				}

				await message.edit(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Reloaded",
						description: `Command has been ${didFindCommand ? "reloaded!" : "unloaded as it could not be found locally!"}`,
					}).setColor("random")],
				});
			}
		}
	}
}
