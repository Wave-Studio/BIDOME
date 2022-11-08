import { getEmojiByName } from "emoji";
import {
	Command,
	CommandContext,
	Embed,
	fragment,
	BotUI,
	ActionRow,
	Button,
} from "harmony";

export default class Calculator extends Command {
	name = "calculator";
	description = 'Who doesn\'t like a good ol "Ti 84"';
	aliases = ["calc", "ti84", "shittyti84"];
	usage = "calculator";
	category = "fun";
	async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: '"Ti 84"',
					description: "```\nPress any button\n```",
					fields: [
						{
							name: "\u200B",
							value: "\u200B",
							inline: true,
						},
						{
							name: "\u200B",
							value: "\u200B",
							inline: true,
						},
						{
							name: "Result",
							value: "`0`",
							inline: true,
						},
					],
					footer: {
						icon_url: ctx.author.avatarURL(),
						text: `Requested by ${ctx.author.tag}`,
					},
				}).setColor("random"),
			],
			components: (
				<>
					{/* ( ) back del */}
					<ActionRow>
						<Button style={"blurple"} label={"("} id={"calc-opa"} />
						<Button style={"blurple"} label={")"} id={"calc-cpa"} />
						<Button
							style={"red"}
							emoji={{ name: getEmojiByName("arrow_left") }}
							id={"calc-bck"}
						/>
						<Button
							style={"red"}
							emoji={{ name: getEmojiByName("wastebasket") }}
							id={"calc-clr"}
						/>
					</ActionRow>
					{/* 7 8 9 / */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("seven") }}
							id={"calc-7"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("eight") }}
							id={"calc-8"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("nine") }}
							id={"calc-9"}
						/>
						<Button
							style={"green"}
							emoji={{ name: getEmojiByName("heavy_division_sign") }}
							id={"calc-div"}
						/>
					</ActionRow>
					{/* 4 5 6 * */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("four") }}
							id={"calc-4"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("five") }}
							id={"calc-5"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("six") }}
							id={"calc-6"}
						/>
						<Button
							style={"green"}
							emoji={{ name: getEmojiByName("heavy_multiplication_x") }}
							id={"calc-mul"}
						/>
					</ActionRow>
					{/* 1 2 3 - */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("one") }}
							id={"calc-1"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("two") }}
							id={"calc-2"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("three") }}
							id={"calc-3"}
						/>
						<Button
							style={"green"}
							emoji={{ name: getEmojiByName("heavy_minus_sign") }}
							id={"calc-sub"}
						/>
					</ActionRow>
					{/*  0 . = + */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("zero") }}
							id={"calc-0"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("black_circle_for_record") }}
							id={"calc-dot"}
						/>
						<Button style={"blurple"} label={"^"} id={"calc-exp"} />
						<Button
							style={"green"}
							emoji={{ name: getEmojiByName("heavy_plus_sign") }}
							id={"calc-add"}
						/>
					</ActionRow>
				</>
			),
		});
	}
}
