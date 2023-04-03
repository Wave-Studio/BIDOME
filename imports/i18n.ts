import { Embed, EmbedPayload } from "./harmony.ts";

interface RecursiveRecord {
	[key: string]: string | string[] | RecursiveRecord;
}

const logFunction = console.log;

console.log = (...args: unknown[]) => {
	const date = new Date();
	const amOrPm = date.getHours() > 12 ? "PM" : "AM";
	const hours = amOrPm == "AM" ? date.getHours() : date.getHours() - 12;

	logFunction(
		`[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${hours}:${
			date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
		}${amOrPm}]`,
		...args,
	);
};

import { loopFilesAndReturn } from "./tools.ts";
import { Member, User } from "./harmony.ts";

interface Language {
	language: {
		short: string;
		full: string;
	};
}

const languages: Record<string, Language> = {};

for (const langFile of await loopFilesAndReturn("./lang/", [".json"])) {
	if (/[a-z]{2}\.json/.test(langFile)) {
		const fileContents = await Deno.readTextFile(langFile);
		let fileData: Language;
		try {
			fileData = JSON.parse(fileContents);
		} catch {
			console.log(`[i18n] Failed to parse ${langFile}! Skipping...`);
			continue;
		}

		if (fileData == undefined) continue;
		const langCode = fileData.language.short;
		languages[langCode] = fileData;
		console.log(
			`[i18n] Loaded language ${fileData.language.short}-${fileData.language.full}`,
		);
	}
}

console.log(`[i18n] Loaded ${Object.keys(languages).length} languages!`);

export function getString(
	lang: string,
	key: string,
	...data: unknown[]
): string {
	const langData = languages[lang] ?? languages["en"];

	const getStringFromJson = (
		key: string,
		currentObject = langData,
	): string | string[] => {
		const [next, ...rest] = key.split(".");
		if (rest.length == 0) {
			// @ts-expect-error it should work
			return currentObject[next];
		} else {
			// @ts-expect-error it should work
			const futureObject = currentObject[next];
			if (futureObject == undefined) {
				if (lang != "en") {
					return getString("en", key, ...data);
				}
				return `Invalid language key: ${key}`;
			}
			return getStringFromJson(rest.join("."), futureObject);
		}
	};

	let fetchedString = getStringFromJson(key);

	if (typeof fetchedString != "string") {
		fetchedString = fetchedString.join("\n");
	}

	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			fetchedString = fetchedString.replace(`{${i}}`, `${data[i]}`);
		}
	}

	return fetchedString;
}

export async function getUserLanguage(
	_user: User | Member | string,
): Promise<string> {
	return await "en";
}

export function getLanguage(lang: string): Language {
	return languages[lang] ?? languages["en"];
}

export function getAllLanguageData(): Record<string, Language> {
	return languages;
}

export function getLanguageList(): string[] {
	return Object.keys(languages);
}

export function createEmbedFromLangData(
	lang: string,
	path: string,
	...data: unknown[]
) {
	const langData = languages[lang] ?? languages["en"];

	const grabData = (
		path: string,
		currentObject = langData,
	): RecursiveRecord => {
		const [next, ...rest] = path.split(".");
		// @ts-expect-error it should work
		const object = currentObject[next];
		if (rest.length == 0) {
			return object;
		} else {
			return grabData(rest.join("."), object);
		}
	};

	const applyVariables = (
		embed: RecursiveRecord,
		data: unknown[],
	): RecursiveRecord => {
		for (const [key] of Object.entries(embed)) {
			if (
				typeof embed[key] == "object" && !(embed[key] instanceof Array)
			) {
				return applyVariables(
					embed[key] as Record<string, string>,
					data,
				);
			} else {
				if (embed[key] instanceof Array) {
					embed[key] = (embed[key] as string[]).join("\n");
				}
				for (let i = 0; i < data.length; i++) {
					embed[key] = (embed[key] as string).replace(
						`{${i}}`,
						`${data[i]}`,
					);
				}
			}
		}
		return embed;
	};

	const embedData = grabData(path);
	const embedWithVariables = applyVariables(
		embedData,
		data,
	);

	return new Embed({
		...embedWithVariables as EmbedPayload,
	}).setColor("random").toJSON();
}
