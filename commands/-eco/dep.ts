import { Command, CommandContext, Embed } from "harmony";
import { getProfileFromDatabase, saveProfile } from "eco";

const allRegex = /(all|max)/i;

export default class Deposit extends Command {
	name = "deposit";
	aliases = ["dep"];
	description = "Deposit coins into bank";
	category = "eco";
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		if (ctx.argString != "") {
			let number = parseInt(ctx.argString);
			if (isNaN(number) && !allRegex.test(ctx.argString)) {
				await ctx.message.reply(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: "Bidome eco",
						description:
							`That's not a valid number! Please provide a valid number`,
					}).setColor("random")],
				});
			} else {
				if (number < 0) {
					await ctx.message.reply(undefined, {
						embeds: [new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user?.avatarURL(),
							},
							title: "Bidome eco",
							description:
								`You can't deposit negative amounts! Use ${ctx.prefix}withdraw to withdraw coins`,
						}).setColor("random")],
					});
				} else {
					const profile = await getProfileFromDatabase(
						ctx.guild.id,
						ctx.author.id,
						ctx.author.tag,
					);
					if (allRegex.test(ctx.argString)) {
						number = profile.balance;
					}
					if (profile.balance < number) {
						await ctx.message.reply(undefined, {
							embeds: [new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.message.client.user
										?.avatarURL(),
								},
								title: "Bidome eco",
								description:
									`You need to actually have that much money!`,
							}).setColor("random")],
						});
					} else {
						if (profile.bank >= profile.maxBankSpace) {
							await ctx.message.reply(undefined, {
								embeds: [new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.message.client.user
											?.avatarURL(),
									},
									title: "Bidome eco",
									description:
										`You can't put any more coins in your bank!`,
								}).setColor("random")],
							});
						} else {
							if (profile.bank + number > profile.maxBankSpace) {
								number = profile.maxBankSpace - profile.bank;
							}
							profile.bank += number;
							profile.balance -= number;
							saveProfile(ctx.guild.id, profile);
							await ctx.message.reply(undefined, {
								embeds: [new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.message.client.user
											?.avatarURL(),
									},
									title: "Bidome eco",
									description: `Depositied $${number}`,
								}).setColor("random")],
							});
						}
					}
				}
			}
		} else {
			await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Bidome eco",
					description: `You must deposit an amount!`,
				}).setColor("random")],
			});
		}
	}
}
