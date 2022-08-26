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
					icon_url: ctx.message.client.user!.avatarURL(),
				},
				description: "Executing code!",
			}).setColor("random")],
		});

		let executed: string;

		try {
			executed = (`${await eval(code) ?? "No output!"}`).replace(ctx.client.token!, "lol you thought");
		} catch (e: unknown) {
			const executed = (`${e ?? "No output!"}`).replace(ctx.client.token!, "lol you thought");
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
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Error occured while executing!",
					description: `${executed.length > 2000 ? "Output too long to send!" : executed}`,
				}).setColor("random"),
			);
			return;
		} finally {
			console.log(
				"Output from command " + code + ", ",
				executed!,
			);
			await message.edit(
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Executed code",
					description: `${executed!.length > 2000 ? "Output too long to send!" : executed!}`,
				}).setColor("random"),
			);
		}
	}
}
