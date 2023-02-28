import {
	Command,
	CommandContext,
	Embed,
	InteractionResponseType,
	isMessageComponentInteraction,
} from "harmony";
import { getPrefixes, addPrefix, removePrefix } from "supabase";

export default class Config extends Command {
	name = "config";
	aliases = ["settings", "options"];
	category = "staff";
	description = "Change settings regarding bidome";
	usage = "Config";
	userPermissions = "MANAGE_GUILD";

	async execute(ctx: CommandContext) {
		if (!ctx.guild?.id) return;
		const currentTime = Date.now();
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					description: "Please select a category from below!",
					footer: {
						text: "This will time out in 30 seconds!",
					},
				}).setColor("random"),
			],
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
					],
				},
			],
		});
		const [response] = await ctx.client.waitFor(
			"interactionCreate",
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith("-" + currentTime) &&
				i.user.id === ctx.author.id,
			30 * 1000
		);

		if (!response) {
			await message.edit({
				components: [],
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						description: "Config prompt timed out!",
					}).setColor("random"),
				],
			});
			return;
		} else {
			if (!isMessageComponentInteraction(response)) return;
			switch (response.customID.split("-")[0]) {
				case "prefix": {
					await message.edit({
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										label: "Add prefix",
										customID: "addprefix-" + currentTime,
										style: "GREEN",
									},
									{
										type: 2,
										label: "Remove prefix",
										customID: "rmprefix-" + currentTime,
										style: "RED",
									},
								],
							},
						],
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								description:
									"Current prefixes: ```" +
									(await (await getPrefixes(ctx.guild!.id)).join("\n")) +
									"```",
								footer: {
									text: "Changing the prefix will time out in 30 seconds!",
								},
							}).setColor("random"),
						],
					});
					await response.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					const changePrefix = await ctx.client.waitFor(
						"interactionCreate",
						(i) =>
							isMessageComponentInteraction(i) &&
							i.customID.endsWith("-" + currentTime) &&
							i.user.id === ctx.author.id,
						30 * 1000
					);
					const willChange = changePrefix[0];
					if (!willChange) {
						await message.edit({
							components: [],
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									description: "Prefix change timed out!",
								}).setColor("random"),
							],
						});
					} else {
						if (!isMessageComponentInteraction(willChange)) return;
						switch (willChange.customID.split("-")[0]) {
							case "addprefix": {
								await message.edit({
									components: [],
									embeds: [
										new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user!.avatarURL(),
											},
											description: "Please send the new prefix in chat!",
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
										}).setColor("random"),
									],
								});

								const [prefix] = await ctx.client.waitFor(
									"messageCreate",
									(i) =>
										i.channel.id === ctx.channel.id &&
										ctx.author.id === i.author.id,
									30 * 1000
								);
								if (!prefix) {
									await message.edit({
										embeds: [
											new Embed({
												author: {
													name: "Bidome bot",
													icon_url: ctx.client.user!.avatarURL(),
												},
												description: "Prefix change timed out!",
											}).setColor("random"),
										],
									});
								} else {
									const allowedChars =
										"abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()<>,.?/|;{}[]:+=-".split(
											""
										);
									if (prefix.content.length > 5) {
										await prefix.reply(undefined, {
											embeds: [
												new Embed({
													author: {
														name: "Bidome bot",
														icon_url: ctx.client.user?.avatarURL(),
													},
													description:
														"Prefix length is longer than the maximum allowed! (5) \nPrefix change has been canceled",
												}).setColor("random"),
											],
										});
										return;
									} else {
										let shouldChangePrefix = true;

										for (const letter of prefix.content.toLowerCase()) {
											if (allowedChars.includes(letter)) continue;
											else {
												await prefix.reply(undefined, {
													embeds: [
														new Embed({
															author: {
																name: "Bidome bot",
																icon_url: ctx.client.user?.avatarURL(),
															},
															description:
																"An invalid character was provided! `` " +
																letter +
																" ``",
														}).setColor("random"),
													],
												});
												shouldChangePrefix = false;
												return;
											}
										}
										if (!shouldChangePrefix) return;

										addPrefix(ctx.guild!.id, prefix.content.toLowerCase());

										await prefix.reply(undefined, {
											embeds: [
												new Embed({
													author: {
														name: "Bidome bot",
														icon_url: ctx.client.user!.avatarURL(),
													},
													description:
														"Added prefix `" +
														prefix.content.toLowerCase() +
														"`",
												}).setColor("random"),
											],
										});
									}
								}
								break;
							}

							case "rmprefix": {
								await message.edit({
									components: [],
									embeds: [
										new Embed({
											author: {
												name: "Bidome bot",
												icon_url: ctx.client.user!.avatarURL(),
											},
											description: "Please send the prefix to remove in chat!",
											fields: [
												{
													name: "Current prefixes",
													value:
														"```" +
														(await (
															await getPrefixes(ctx.guild.id)
														).join("\n")) +
														"```",
												},
											],
											footer: {
												text: "This will time out in 30 seconds!",
											},
										}).setColor("random"),
									],
								});

								const [prefix] = await ctx.client.waitFor(
									"messageCreate",
									(i) =>
										i.channel.id === ctx.channel.id &&
										ctx.author.id === i.author.id,
									30 * 1000
								);
								if (!prefix) {
									await message.edit({
										embeds: [
											new Embed({
												author: {
													name: "Bidome bot",
													icon_url: ctx.client.user!.avatarURL(),
												},
												description: "Prefix removal timed out!",
											}).setColor("random"),
										],
									});
								} else {
									if (
										!(await getPrefixes(ctx.guild.id)).includes(
											prefix.content.toLowerCase()
										)
									) {
										await prefix.reply(undefined, {
											embeds: [
												new Embed({
													author: {
														name: "Bidome bot",
														icon_url: ctx.client.user?.avatarURL(),
													},
													description:
														"This prefix is not in the list of prefixes!",
												}).setColor("random"),
											],
										});
										return;
									} else {
										removePrefix(ctx.guild!.id, prefix.content.toLowerCase());

										await prefix.reply(undefined, {
											embeds: [
												new Embed({
													author: {
														name: "Bidome bot",
														icon_url: ctx.client.user!.avatarURL(),
													},
													description:
														"Removed prefix `" +
														prefix.content.toLowerCase() +
														"`",
												}).setColor("random"),
											],
										});
									}
								}
								break;
							}
						}
					}
					break;
				}

				default: {
					throw new Error(
						`Invalid Config Option: ${response.customID.split("-")[0]}`
					);
				}
			}
		}
	}
}
