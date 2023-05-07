import {
	activity,
	flags,
	food,
	nature,
	objects,
	people,
	symbols,
	travel,
} from "https://deno.land/x/discord_emoji@v2.2.0/mod.ts";

export const emoji = (name: string) => {
	for (const emojiJson of [
		activity,
		flags,
		food,
		nature,
		objects,
		people,
		symbols,
		travel,
	]) {
		// @ts-ignore Typings
		if (emojiJson[name]) return emojiJson[name];
	}
	return undefined;
}

// TODO: Migrate commands to new emoji system

import { emojiData } from "https://deno.land/x/getmoji@1.2.4/emojiData.ts";
// Modified from getmoji/mod.ts

const filterEmoji = (emojiName: string) => {
	return emojiData.filter((data) => data.name === emojiName);
};

export const getEmojiByName = (name: string) => {
	const filteredData = filterEmoji(name);
	return filteredData.length ? filteredData[0].char : "emoji not found";
};

export const emojify = (inputString: string) => {
	const splittedStr = inputString.split(" ");
	const newArr = splittedStr.map((str: string) => {
		if (str.includes("$"))
			return filterEmoji(str.substring(1)).length
				? filterEmoji(str.substring(1))[0].char
				: str;
		return str;
	});
	return newArr.join(" ");
};
