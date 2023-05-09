import { Embed, MessageComponentInteraction } from "harmony";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";
import { supabase } from "supabase";

export async function button(i: MessageComponentInteraction) {
	const lang = await getUserLanguage(i.user.id);
	if (i.customID.startsWith("cfg-")) {
		const isSameUser = i.message.embeds[0]
			.footer!.icon_url!.split("/avatars/")[1]
			.split("/")[0] === i.user.id;

		if (!isSameUser) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.config.notyours",
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}),
				],
			});
			return false;
		}

		if (!i.member!.permissions.has("MANAGE_GUILD", true)) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.config.noperms",
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}),
				],
			});
			return false;
		}
	}

	if (i.customID == "cfg-dny-chnl") {
		await i.message.edit({
			embeds: [
				new Embed({
					...createEmbedFromLangData(
						lang,
						"interactions.config.suggestions.pickdenychannel",
					),
					author: {
						name: "Bidome bot",
						icon_url: i.client.user!.avatarURL(),
					},
					footer: {
						text: getString(
							lang,
							"interactions.config.suggestions.expiresin",
						),
					},
				}),
			],
			components: [],
		});

		const [response] = await i.client.waitFor(
			"messageCreate",
			(m) =>
				m.author.id == i.user.id &&
				i.channel!.id == m.channel.id &&
				(m.mentions.channels.size > 0 ||
					m.content.toLowerCase() == "none" ||
					m.content.toLowerCase() == "cancel"),
			30 * 1000,
		);

		if (!response) {
			await i.message.edit({
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.config.suggestions.timeout",
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}),
				],
				components: [],
			});
		} else {
			if (response.content.toLowerCase() == "cancel") {
				await i.message.edit({
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"interactions.config.suggestions.canceled",
							),
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}),
					],
					components: [],
				});
			} else {
				if (response.content.toLowerCase() == "none") {
					await supabase
						.from("servers")
						.update({
							suggestion_denied_channel: null,
						})
						.eq("server_id", i.guild!.id);

					await i.message.edit({
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"interactions.config.suggestions.removed",
								),
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
							}),
						],
						components: [],
					});
				} else {
					const channel = response.mentions.channels.first()!;
					const botPermissions = await channel.permissionsFor(
						i.client.user!.id,
					);
					const missingPerms = [];

					for (
						const permission of [
							"SEND_MESSAGES",
							"MANAGE_THREADS",
							"CREATE_PUBLIC_THREADS",
							"EMBED_LINKS",
						]
					) {
						const haspermission = botPermissions.has(permission);
						if (!haspermission) {
							missingPerms.push(permission);
						}
					}

					if (missingPerms.length > 0) {
						await i.message.edit({
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"interactions.config.suggestions.missingperms",
										missingPerms.join(", "),
									),
									author: {
										name: "Bidome bot",
										icon_url: i.client.user!.avatarURL(),
									},
								}),
							],
							components: [],
						});
					} else {
						await supabase
							.from("servers")
							.update({
								suggestion_denied_channel: channel.id,
							})
							.eq("server_id", i.guild!.id);

						await i.message.edit({
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"interactions.config.suggestions.setdenychannel",
										`<#${channel.id}>`,
									),
									author: {
										name: "Bidome bot",
										icon_url: i.client.user!.avatarURL(),
									},
								}),
							],
							components: [],
						});
					}
				}
			}
		}
		return false;
	}
}
