import { Command, CommandContext, Embed } from "harmony";
import { getProfileFromDatabase, saveProfile } from "eco";

const allRegex = /(all|max)/i;

export default class Pay extends Command {
	name = "send";
	aliases = ["give", "pay"];
	description = "Send someone money";
	usage = "send <number>";
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
							description: `You can't give negative amounts!`,
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
						const message = await ctx.message.reply(undefined, {
							embeds: [new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.message.client.user
										?.avatarURL(),
								},
								title: "Bidome eco",
								description:
									`Mention a user to send $${number} to or type \`cancel\` to cancel!`,
								footer: {
									text: "This will time out in 30 seconds!",
								},
							}).setColor("random")],
						});

						const [response] = await ctx.client.waitFor(
							"messageCreate",
							(m) =>
								m.author.id == ctx.author.id &&
								m.channel.id == ctx.channel.id &&
								(m.mentions.users.size > 0 ||
									m.content.toLowerCase() == "cancel"),
							30000,
						);

						if (!response) {
							return await message.edit(undefined, {
								embeds: [new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.message.client.user
											?.avatarURL(),
									},
									title: "Bidome eco",
									description: `Sending timed out!`,
								}).setColor("random")],
							});
						} else {
							if (response.content.toLowerCase() == "cancel") {
								return await message.edit(undefined, {
									embeds: [new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.message.client.user
												?.avatarURL(),
										},
										title: "Bidome eco",
										description: `Canceled sending!`,
									}).setColor("random")],
								});
							} else {
								const target = response.mentions.users.first();
								if (!target) {
									return await message.edit(undefined, {
										embeds: [new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.message.client
													.user?.avatarURL(),
											},
											title: "Bidome eco",
											description:
												`Unable to find target user!`,
										}).setColor("random")],
									});
								} else {
									const userProfile =
										await getProfileFromDatabase(
											ctx.guild.id,
											ctx.author.id,
											ctx.author.tag,
										);
									const targetProfile =
										await getProfileFromDatabase(
											ctx.guild.id,
											target.id,
											target.tag,
										);
									if (userProfile.balance < number) {
										return await ctx.message.reply(
											undefined,
											{
												embeds: [new Embed({
													author: {
														name: "Bidome bot",
														icon_url: ctx.message
															.client.user
															?.avatarURL(),
													},
													title: "Bidome eco",
													description:
														`You need to actually have that much money!`,
												}).setColor("random")],
											},
										);
									} else {
										userProfile.balance -= number;
										targetProfile.balance += number;
										await saveProfile(
											ctx.guild.id,
											userProfile,
										);
										await saveProfile(
											ctx.guild.id,
											targetProfile,
										);
										return await message.edit(undefined, {
											embeds: [new Embed({
												author: {
													name: "Bidome bot",
													icon_url: ctx.message.client
														.user?.avatarURL(),
												},
												title: "Bidome eco",
												description:
													`Sent ${number} to ${target.tag}!`,
											}).setColor("random")],
										});
									}
								}
							}
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
