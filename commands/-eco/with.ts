import { Command, CommandContext, Embed } from "harmony";
import { getProfileFromDatabase, saveProfile } from "eco";

const allRegex = /(all|max)/i;

export class command extends Command {
	name = "withdraw";
	aliases = ["with"];
	description = "Withdraw coins from your bank";
	category = "eco";
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		if (ctx.argString != "") {
			let number = parseInt(ctx.argString);
			if (isNaN(number) && !allRegex.test(ctx.argString)) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: "Bidome eco",
						description:
							`That's not a valid number! Please provide a valid number`,
					}).setColor("random"),
				});
			} else {
				if (number < 0) {
					await ctx.message.reply(undefined, {
						embed: new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user?.avatarURL(),
							},
							title: "Bidome eco",
							description:
								`You can't withdraw negative amounts! Use ${ctx.prefix}deposit to deposit coins`,
						}).setColor("random"),
					});
				} else {
					const profile = await getProfileFromDatabase(
						ctx.guild.id,
						ctx.author.id,
						ctx.author.tag,
					);
					if (allRegex.test(ctx.argString)) {
						number = profile.bank;
					}
					if (profile.bank < number) {
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.message.client.user
										?.avatarURL(),
								},
								title: "Bidome eco",
								description:
									`You need to actually have that much money!`,
							}).setColor("random"),
						});
					} else {
						profile.bank -= number;
						profile.balance += number;
						saveProfile(ctx.guild.id, profile);
						await ctx.message.reply(undefined, {
							embed: new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.message.client.user
										?.avatarURL(),
								},
								title: "Bidome eco",
								description: `Withdrew $${number}`,
							}).setColor("random"),
						});
					}
				}
			}
		} else {
			await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: "Bidome eco",
					description: `You must withdraw an amount!`,
				}).setColor("random"),
			});
		}
	}
}
