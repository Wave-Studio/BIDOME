import {
	Embed,
	ModalSubmitInteraction,
	MessageComponentInteraction,
} from "harmony";
import { getPrefixes, addPrefix } from "settings";
import { getUserLanguage, createEmbedFromLangData, getString } from "i18n";

export async function button(i: MessageComponentInteraction) {
	const lang = await getUserLanguage(i.user.id);
	if (i.customID.startsWith("cfg-")) {
		const isSameUser =
			i.message.embeds[0]
				.footer!.icon_url!.split("/avatars/")[1]
				.split("/")[0] === i.user.id;

		if (!isSameUser) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(lang, "interactions.config.notyours"),
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
						...createEmbedFromLangData(lang, "interactions.config.noperms"),
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

	if (i.customID == "cfg-addprefix") {
		i.showModal({
			title: getString(lang, "interactions.config.modals.addprefix.title"),
			customID: "cfg-addprefix",
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
								"interactions.config.modals.addprefix.input"
							),
							placeholder: getString(
								lang,
								"interactions.config.modals.addprefix.placeholder"
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
	if (i.customID == "cfg-addprefix") {
		const lang = await getUserLanguage(i.user.id);
		const prefixes = await getPrefixes(i.guild!.id);
		// Half of these prob don't need to be escaped but /shrug
		const prefixRegex =
			/([A-Za-z0-9]|[\~\!\@\#\$\%\^\&\*\(\)\_\+\=\-\[\]\{\}\\\|\;\:\'\"\,\<\.\>\/\?]){1,5}/;
		const prefix = i.getComponent("prefix")!.value;

		if (prefixes.includes(prefix)) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"interactions.config.prefix.prefixexists"
						),
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
					}).setColor("red"),
				],
			});
		} else {
			const doesPrefixPass = prefixRegex.test(prefix);
			if (!doesPrefixPass) {
				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"interactions.config.prefix.prefixinvalid",
								prefix
							),
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}).setColor("red"),
					],
				});
			} else {
				await addPrefix(i.guild!.id, prefix);
				await i.respond({
					ephemeral: true,
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"interactions.config.prefix.prefixadded",
								prefix
							),
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
						}).setColor("green"),
					],
				});
			}
		}
		return false;
	}
}
