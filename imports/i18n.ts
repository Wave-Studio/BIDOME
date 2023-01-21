const logFunction = console.log;

console.log = (...args: unknown[]) => {
	const date = new Date();
	const amOrPm = date.getHours() > 12 ? "PM" : "AM";
	const hours = amOrPm == "AM" ? date.getHours() : date.getHours() - 12;

	logFunction(
		`[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${hours}:${
			date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
		}${amOrPm}]`,
		...args
	);
};

export * from "./i18n.types.ts";
import { LanguageFile } from "./i18n.types.ts";
import { loopFilesAndReturn } from "./tools.ts";

const languages: Record<string, LanguageFile> = {};

for (const langFile of await loopFilesAndReturn("./lang/", [".json"])) {
	if (/[a-z]{2}\.json/.test(langFile)) {
		const fileContents = await Deno.readTextFile(langFile);
		let fileData: LanguageFile;
		try {
			fileData = JSON.parse(fileContents);
		} catch {
			console.log(`[i18n] Failed to parse ${langFile}! Skipping...`);
			continue;
		}

		if (fileData == undefined) continue;
		const langCode = fileData.language.short;
		languages[langCode] = fileData;
		console.log(`[i18n] Loaded language ${fileData.language.short}-${fileData.language.full}`);
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
		currentObject = langData
	): string | string[] => {
		const [next, ...rest] = key.split(".");
		if (rest.length == 0) {
			// @ts-expect-error it should work
			return currentObject[next];
		} else {
			// @ts-expect-error it should work
			const futureObject = currentObject[next];
			if (futureObject == undefined) return getString("en", key, ...data);
			return getStringFromJson(rest.join("."), futureObject);
		}
	};

	let fetchedString = getStringFromJson(key);

	if (typeof fetchedString != "string")
		fetchedString = fetchedString.join("\n");
		
	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			fetchedString = fetchedString.replace(`{${i}}`, `${data[i]}`);
		}
	}

	return fetchedString;
}

export function getLanguage(lang: string): LanguageFile {
	return languages[lang] ?? languages["en"];
}

export function getAllLanguageData(): Record<string, LanguageFile> {
	return languages;
}

export function getLanguageList(): string[] {
	return Object.keys(languages);
}
