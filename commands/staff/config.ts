import {
	Command,
	CommandContext,
	Embed,
	InteractionResponseType,
	isMessageComponentInteraction,
} from "harmony";
import { Database } from "database";
import { isGlobalEco, isServerEco } from "eco";

export default class Config extends Command {
	name = "config";
	aliases = ["settings", "options"];
	category = "staff";
	userPermissions = "ADMINISTRATOR";
	description = "Change settings regarding bidome";
	usage = "Config";
	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		const currentTime = Date.now();
		const message = await ctx.message.reply(undefined, {
			embeds: [new Embed({
				author: {
					name: "Bidome bot",
					icon_url: ctx.client.user?.avatarURL(),
				},
				description: "Please select a category from below!",
				footer: {
					text: "This will time out in 30 seconds!",
				},
			}).setColor("random")],
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							label: "Prefix",
							customID: "prefix-" + currentTime,
							style: "BLURPLE",
						},
						// Removed until I can figure out why it's broken
						// {
						// 	type: 2,
						// 	label: 'Global Eco',
						// 	customID: 'geco-' + currentTime,
						// 	style: 'BLURPLE',
						// },
					],
				},
			],
		});
		const response = await ctx.client.waitFor(
			"interactionCreate",
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith("-" + currentTime) &&
				i.user.id === ctx.author.id,
			30 * 1000,
		);

		const res = response[0];

		if (!res) {
			await message.edit({
				components: [],
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user?.avatarURL(),
					},
					description: "Config prompt timed out!",
				}).setColor("random")],
			});
			return;
		} else {
			if (!isMessageComponentInteraction(res)) return;
			switch (res.customID.split("-")[0]) {
				case "prefix": {
					await message.edit({
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										label: "Change prefix",
										customID: "changeprefix-" + currentTime,
										style: "BLURPLE",
									},
								],
							},
						],
						embeds: [new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							description: "Current prefix: `" +
								(await Database.get(
									"prefix." + ctx.guild?.id,
								)) +
								"`",
							footer: {
								text:
									"Changing the prefix will time out in 30 seconds!",
							},
						}).setColor("random")],
					});
					await res.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					const changePrefix = await ctx.client.waitFor(
						"interactionCreate",
						(i) =>
							isMessageComponentInteraction(i) &&
							i.customID.endsWith("-" + currentTime) &&
							i.user.id === ctx.author.id,
						30 * 1000,
					);
					const willChange = changePrefix[0];
					if (!willChange) {
						await message.edit({
							components: [],
							embeds: [new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								description: "Prefix change timed out!",
							}).setColor("random")],
						});
					} else {
						await message.edit({
							components: [],
							embeds: [new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								description:
									"Please send the new prefix in chat!",
								fields: [
									{
										name: "Prefix rules",
										value: [
											"```yml",
											" - Must be 5 characters or fewer in length",
											" - Allowed characters: ",
											"  - A-Z 0-9 !@#$%^&*()<>,.?/|;{}[]:+=-",
											"```",
										].join("\n"),
									},
								],
								footer: {
									text: "This will time out in 30 seconds!",
								},
							}).setColor("random")],
						});
						const newPrefix = await ctx.client.waitFor(
							"messageCreate",
							(i) =>
								i.channel.id === ctx.channel.id &&
								ctx.author.id === i.author.id,
							30 * 1000,
						);
						const prefix = newPrefix[0];
						if (!prefix) {
							await message.edit({
								embeds: [new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									description: "Prefix change timed out!",
								}).setColor("random")],
							});
						} else {
							const allowedChars =
								"abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()<>,.?/|;{}[]:+=-"
									.split(
										"",
									);
							if (prefix.content.length > 5) {
								await prefix.reply(undefined, {
									embeds: [new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user
												?.avatarURL(),
										},
										description:
											"Prefix length is longer than the maximum allowed! (5)",
									}).setColor("random")],
								});
							}

							let shouldChangePrefix = true;

							for (const letter of prefix.content.toLowerCase()) {
								if (allowedChars.includes(letter)) continue;
								else {
									await prefix.reply(undefined, {
										embeds: [new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user
													?.avatarURL(),
											},
											description:
												"An invalid character was provided! `` " +
												letter +
												" ``",
										}).setColor("random")],
									});
									shouldChangePrefix = false;
									return;
								}
							}
							if (!shouldChangePrefix) return;
							await Database.set(
								"prefix." + ctx.guild.id,
								prefix.content.toLowerCase(),
							);
							await prefix.reply(undefined, {
								embeds: [new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user?.avatarURL(),
									},
									description:
										"The prefix has been changed to `` " +
										prefix.content.toLowerCase() +
										" ``",
								}).setColor("random")],
							});
						}
					}
					break;
				}

				case "geco": {
					await message.edit({
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										label: "Global Economy",
										customID: "global-" + currentTime,
										style: "BLURPLE",
									},
									{
										type: 2,
										label: "Server Economy",
										customID: "server-" + currentTime,
										style: "BLURPLE",
									},
								],
							},
						],
						embeds: [new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user?.avatarURL(),
							},
							fields: [
								{
									name: "Important",
									value:
										"❗ Changing economy type **WILL NOT** reset your progress ❗",
								},
								{
									name: `${
										isGlobalEco(ctx.guild.id)
											? "Current:"
											: "Default:"
									} Global Economy`,
									value: [
										"Economy that can be accessed on any server with Bidome & Global Economy",
										"Doesn't allow staff to give/remove items from users",
									].join("\n"),
								},
								{
									name: `${
										isServerEco(ctx.guild.id)
											? "Current: "
											: ""
									}Server Economy`,
									value: [
										`Economy that can only be accessed on this server.`,
										"Allows staff to modify other user's balance & inventory",
									].join("\n"),
									inline: true,
								},
							],
							footer: {
								text:
									"Changing eco type will time out in 30 seconds!!",
							},
						}).setColor("random")],
					});
					await res.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					const [selectedEcoType] = await ctx.client.waitFor(
						"interactionCreate",
						(i) =>
							isMessageComponentInteraction(i) &&
							i.customID.endsWith("-" + currentTime) &&
							i.user.id === ctx.author.id,
						30 * 1000,
					);
					if (!selectedEcoType) {
						await message.edit({
							components: [],
							embeds: [new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user?.avatarURL(),
								},
								description: "Economy type change timed out!",
							}).setColor("random")],
						});
					} else {
						if (!isMessageComponentInteraction(selectedEcoType)) {
							return;
						}
						switch (selectedEcoType.customID.split("-")[0]) {
							case "global": {
								const serverValues = (
									Database.get("eco.notglobal") as string[]
								).filter((s) => s !== ctx.guild?.id);

								Database.set("eco.notglobal", serverValues);

								await message.edit({
									components: [],
									embeds: [new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user
												?.avatarURL(),
										},
										description:
											"Economy type changed to Global!",
									}).setColor("random")],
								});
								break;
							}

							case "server": {
								const serverValues = (
									Database.get("eco.notglobal") as string[]
								).filter((s) => s !== ctx.guild?.id);

								serverValues.push(ctx.guild.id);

								Database.set("eco.notglobal", serverValues);

								await message.edit({
									components: [],
									embeds: [new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user
												?.avatarURL(),
										},
										description:
											"Economy type changed to Server!",
									}).setColor("random")],
								});

								break;
							}

							default: {
								throw new Error(
									`Invalid Eco Type: ${
										selectedEcoType.customID.split("-")[0]
									}`,
								);
							}
						}
					}
					break;
				}
				default: {
					throw new Error(
						`Invalid Config Option: ${res.customID.split("-")[0]}`,
					);
				}
			}
		}
	}
}
