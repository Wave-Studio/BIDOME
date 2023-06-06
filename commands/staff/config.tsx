import {
	ActionRow,
	BotUI,
	Button,
	Command,
	CommandContext,
	Embed,
	fragment,
} from "harmony";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";

export default class Config extends Command {
	name = "config";
	aliases = ["settings", "options"];
	category = "staff";
	description = "Change settings regarding bidome";
	usage = "Config";
	userPermissions = "MANAGE_GUILD";

	async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author.id);
		await ctx.message.reply({
			embeds: [
				new Embed({
					...createEmbedFromLangData(lang, "commands.config.default"),
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					footer: {
						icon_url: ctx.author.avatarURL(),
						text: `Requested by ${ctx.author.tag}`,
					},
				}),
			],
			components: (
				<>
					<ActionRow>
						<Button
							style="blurple"
							id={"cfg-prefix"}
							label={getString(
								lang,
								"commands.config.buttons.prefix",
							)}
						/>
						{
							/* <Button
							style="blurple"
							id={"cfg-suggest"}
							label={getString(
								lang,
								"commands.config.buttons.suggestions",
							)}
						/> */
						}
						<Button
							style="blurple"
							id={"cfg-betas"}
							label={getString(
								lang,
								"commands.config.buttons.betas",
							)}
						/>
					</ActionRow>
				</>
			),
		});
	}
}
