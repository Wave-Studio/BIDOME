import { Command, CommandContext, Embed } from "harmony";

interface Magic8ballResponses {
	responses: string[];
}

const { responses } = JSON.parse(
	await Deno.readTextFile("./assets/fun.json"),
).eightball as Magic8ballResponses;

export class command extends Command {
	name = "8ball";
	description = "Just a regular 8ball";
	aliases = ["magic8ball", "eightball", "magiceightball"];
	usage = "8ball <question>";
	category = "fun";
	async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Magic 8Ball",
					description:
						`You need to provide a question to ask the Magic 8Ball!`,
				}).setColor("random"),
			});
		} else {
			const message = await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Magic 8Ball",
					description: `Contacting the oracle`,
				}).setColor("random"),
			});
			await setTimeout(async () => {
				await message.edit(
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: "Magic 8Ball",
						fields: [
							{
								name: "Asked by",
								value: `${ctx.author.tag}`,
							},
							{
								name: "Asked",
								value: `${ctx.argString}`,
							},
							{
								name: "Response from the Magic 8Ball",
								value: responses[
									Math.floor(Math.random() * responses.length)
								],
							},
						],
					}).setColor("random"),
				);
			}, 2000);
		}
	}
}
