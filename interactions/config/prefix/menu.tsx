import {
	MessageComponentInteraction,
	InteractionResponseType,
	Embed,
	fragment,
	BotUI,
	ActionRow,
	Button,
} from "harmony";
import { getPrefixes } from "settings";
import { getUserLanguage, createEmbedFromLangData, getString } from "i18n";
import { emoji } from "emoji";

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

	if (i.customID == "cfg-prefix") {
		const prefixes = await getPrefixes(i.guild!.id);
		await i.respond({
			type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
		});
		await i.message.edit({
			embeds: [
				new Embed({
					...createEmbedFromLangData(
						lang,
						"commands.config.prefix",
						prefixes.join("\n")
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
							style="green"
							id={"cfg-addprefix"}
							label={getString(lang, "commands.config.buttons.addprefix")}
						/>
						<Button
							style="red"
							id={"cfg-rmprefix"}
							label={getString(lang, "commands.config.buttons.removeprefix")}
						/>
						<Button
							style="grey"
							emoji={{
								name: emoji("arrows_counterclockwise"),
							}}
							id={"cfg-prefix"}
						/>
					</ActionRow>
				</>
			),
		});
		return false;
	}
}
