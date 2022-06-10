import { Command, CommandContext, Embed } from "harmony";

export default class Eval extends Command {
	name = "eval";
	ownerOnly = true;
	category = "dev";
	aliases = ["execute"];
	description = "Execute code";
	usage = "Eval <code>";
	async execute(ctx: CommandContext) {
		let code = ctx.argString ?? "";
		if (code.startsWith("```ts") || code.startsWith(" ```ts")) {
			code = code.substring(code.split("\n")[0].length, code.length - 3);
		}
		const message = await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				description: "Executing code!",
			}).setColor("random")],
		});

		try {
			const executed = await eval(code);
			console.log(
				"Output from command " + code + ", ",
				executed ?? "No output!",
			);
			await message.edit(
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Executed code",
					description: "Please check console for an output!",
				}).setColor("random"),
			);
		} catch (e: unknown) {
			console.log(
				"An error occured while executing the eval command " +
					code +
					"! Error: ",
				e,
			);
			await message.edit(
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Error occured while executing!",
					description: "Please check console for an error!",
				}).setColor("random"),
			);
			return;
		}
	}
}
