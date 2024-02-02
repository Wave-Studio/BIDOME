import { Language } from "./language.ts";
import { parse } from "$std/yaml/mod.ts";
import { _Lang } from "./types/_lang.ts";

export const languages = new Map<string, Language>();

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
