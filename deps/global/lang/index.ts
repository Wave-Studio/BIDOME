import { Language } from "./language.ts";
import { parse } from "$std/yaml/mod.ts";
import { _Lang } from "./types/_lang.ts";

const languages = new Map<string, Language>();

for await (const lang of Deno.readDir("./lang/")) {
	if (!lang.isDirectory) continue;

	const files: { name: string; content: string }[] = [];

	const langFile = parse(
		await Deno.readTextFile(`./lang/${lang.name}/_lang.yml`),
	) as {
		_lang: _Lang;
	};

	const recursiveFetch = async (path: string) => {
		for await (const file of Deno.readDir(path)) {
			if (file.isDirectory) {
				await recursiveFetch(`${path}/${file.name}`);
			} else {
				files.push({
					name: `.${
						path.substring(`./lang/${lang.name}`.length)
					}/${file.name}`,
					content: await Deno.readTextFile(`${path}/${file.name}`),
				});
			}
		}
	};

	await recursiveFetch(`./lang/${lang.name}`);

	const language = new Language(
		langFile._lang.locale,
		langFile._lang["en-name"],
		langFile._lang.name,
		files,
	);

	languages.set(lang.name, language);
}


export const getLocale = (locale: string) => {
	return languages.get(locale);
}

type ValidArgs = string | number | boolean;

const replaceArgs = (str: string, ...args: ValidArgs[]): string => {
	return str.replace(/{[0-9]{1,}(:[a-z]{1,})?}/g, (str) => {
		const index = parseInt(str.substring(1, str.includes(":") ? str.indexOf(":") : str.length - 1));

		if (args[index] == undefined) return str;

		// TODO: Implement custom tags - Bloxs

		return args[index].toString();
	});
}

export const getString = (locale: string, key: string, ...args: ValidArgs[]): string => {
	const language = getLocale(locale) ?? getLocale("en-US");

	if (language == undefined) throw new Error("Language not found");

	const keyStr = language.getKey(key);

	if (keyStr == undefined) {
		if (locale != "en-US") return getString("en-US", key, ...args);
		return `Key ${key} not found`;
	}

	return replaceArgs(keyStr as string, ...args);
}