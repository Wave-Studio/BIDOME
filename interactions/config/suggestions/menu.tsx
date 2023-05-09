import {
	ActionRow,
	BotUI,
	Button,
	Embed,
	fragment,
	InteractionResponseType,
	MessageComponentInteraction,
} from "harmony";
import { getSuggestionChannels } from "settings";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";
import { emoji } from "emoji";

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

	if (i.customID == "cfg-suggest") {
		const channels = await getSuggestionChannels(i.guild!.id);
		await i.respond({
			type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
		});
		await i.message.edit({
			embeds: [
				new Embed({
					...createEmbedFromLangData(
						lang,
						"commands.config.suggestions",
						channels.suggestion_channel != undefined
							? `<#${channels.suggestion_channel}>`
							: getString(lang, "generic.notset"),
						channels.suggestion_accepted_channel != undefined
							? `<#${channels.suggestion_accepted_channel}>`
							: getString(lang, "generic.notset"),
						channels.suggestion_denied_channel != undefined
							? `<#${channels.suggestion_denied_channel}>`
							: getString(lang, "generic.notset"),
					),
					author: {
						name: "Bidome bot",
						icon_url: i.client.user!.avatarURL(),
					},
					footer: {
						icon_url: i.user.avatarURL(),
						text: `Requested by ${i.user.tag}`,
					},
				}),
			],
			components: (
				<>
					<ActionRow>
						<Button
							style="blurple"
							id="cfg-sug-chnl"
							label={getString(
								lang,
								"commands.config.buttons.setsuggestionchannel",
							)}
						/>
						<Button
							style="blurple"
							id="cfg-act-chnl"
							label={getString(
								lang,
								"commands.config.buttons.setacceptedchannel",
							)}
						/>
						<Button
							style="blurple"
							id="cfg-dny-chnl"
							label={getString(
								lang,
								"commands.config.buttons.setdeniedchannel",
							)}
						/>
						<Button
							style="grey"
							emoji={{
								name: emoji("arrows_counterclockwise"),
							}}
							id={"cfg-suggest"}
						/>
					</ActionRow>
				</>
			),
		});
	}
}
