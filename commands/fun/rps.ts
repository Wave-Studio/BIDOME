import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from "harmony";
import { format } from "tools";

export class command extends Command {
	name = "rps";
	aliases = ["rockpaperscissors"];
	description = "Play RPS against the bot";
	usage = "Rps";
	category = "fun";
	async execute(ctx: CommandContext) {
		const options = ["Scissors", "Rock", "Paper"];
		const now = Date.now();
		const message = await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: "RPS",
				description: "Select your move!",
				footer: {
					text: "This will time out in 30 seconds!",
				},
			}).setColor("random"),
			components: [
				{
					type: 1,
					components: options.map((opt) => ({
						type: 2,
						label: format(opt),
						style: "BLURPLE",
						customID: `${opt.toLowerCase()}-${now}`,
					})),
				},
			],
		});
		const choice = await ctx.client.waitFor(
			"interactionCreate",
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith(`-${now}`),
			30 * 1000,
		);
		if (!choice[0]) {
			await message.edit({
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "RPS",
					description: "Selection timed out!",
				}).setColor("random"),
			});
		} else {
			if (!isMessageComponentInteraction(choice[0])) return;
			const botchoice =
				options[Math.floor(Math.random() * options.length)];
			const playerchoice = format(choice[0].customID.split("-")[0]);
			if (botchoice === playerchoice) {
				await message.edit({
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: "RPS",
						fields: [
							{
								name: "It's a tie!",
								value:
									`Bot: \`${botchoice}\`\n You: \`${playerchoice}\``,
							},
						],
					}).setColor("random"),
					components: [],
				});
			} else {
				await message.edit({
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: "RPS",
						fields: [
							{
								name: (botchoice === "Scissors" &&
										playerchoice === "Paper") ||
										(botchoice === "Paper" &&
											playerchoice === "Rock") ||
										(botchoice === "Rock" &&
											playerchoice === "Scissors")
									? `Bot Wins`
									: `${ctx.author.username} Wins`,
								value:
									`Bot: \`${botchoice}\`\n You: \`${playerchoice}\``,
							},
						],
					}).setColor("random"),
					components: [],
				});
			}
			return;
		}
	}
}
