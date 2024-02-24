import {
	Embed,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "harmony";
import { getPrefixes, removePrefix } from "settings";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";

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

		if (
			!i.member!.permissions.has("MANAGE_GUILD", true) &&
			i.guild?.ownerID != i.user.id
		) {
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

	if (i.customID == "cfg-rmprefix") {
		i.showModal({
			title: getString(
				lang,
				"interactions.config.modals.removeprefix.title",
			),
			customID: "cfg-rmprefix",
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							customID: "prefix",
							style: 1,
							label: getString(
								lang,
								"interactions.config.modals.removeprefix.input",
							),
							placeholder: getString(
								lang,
								"interactions.config.modals.removeprefix.placeholder",
							),
							minLength: 1,
							maxLength: 5,
							required: true,
						},
					],
				},
			],
		});
		return false;
	}
}

export async function modal(i: ModalSubmitInteraction) {
	if (i.customID == "cfg-rmprefix") {
		const lang = await getUserLanguage(i.user.id);
		const prefixes = await getPrefixes(i.guild!.id);
		const prefix = i.getComponent("prefix")!.value;

		if (!prefixes.includes(i.getComponent("prefix")!.value)) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.config.prefix.notprefix",
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}).setColor("red"),
				],
			});
		} else {
			await removePrefix(i.guild!.id, prefix);
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.config.prefix.prefixremoved",
							prefix,
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}).setColor("green"),
				],
			});
		}
		return false;
	}
}
