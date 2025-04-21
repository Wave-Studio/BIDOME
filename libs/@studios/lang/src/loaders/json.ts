import {
	LanguageLoaderPlugin,
	type LoadedLanguageOutput,
	type RecursiveObject,
} from "./plugin.ts";
import {
	getAllRootFolders,
	normalizePath,
	getAllFilesRecursively,
} from "@studios/utils/fs";
import { relative } from "@std/path/relative";
import { join } from "@std/path/join";
// I would use Deno.readTextFile but I want to keep this cross platform - Bloxs
import { readFile } from "node:fs/promises";

// Yes, this is just a copy paste + a few edits from yaml.ts - Bloxs

export class JsonLoaderPlugin extends LanguageLoaderPlugin {
	public override async load(
		defaultLocale = "en-US"
	): Promise<LoadedLanguageOutput> {
		const locales: string[] = (await getAllRootFolders(this.folderBase)).map(
			(l) => normalizePath(relative(this.folderBase, l))
		);
		const langData: LoadedLanguageOutput = {};

		if (locales.length === 0) {
			throw new Error(`No locales found in ${this.folderBase}`);
		}

		if (!locales.find((locale) => locale == defaultLocale)) {
			throw new Error(
				`Default locale ${defaultLocale} not found in ${this.folderBase}`
			);
		}

		const createLangDataFromLocale = async (locale: string) => {
			const lang: RecursiveObject = {};

			const files = (
				await getAllFilesRecursively(join(this.folderBase, locale), [
					".json",
					".jsonc",
				])
			)
				.map((file) =>
					normalizePath(relative(join(this.folderBase, locale), file))
				)
				.filter((f) => !f.startsWith("-"));

			for (const file of files) {
				const parsed = JSON.parse(
					(await readFile(join(this.folderBase, locale, file), "utf8"))
						// Adapted from https://github.com/tarkh/json-easy-strip/blob/master/index.js#L37 + StackOverflow to allow jsonc parsing - Bloxs
						.replace(
							/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
							(m, g) => (g ? "" : m)
						)
				) as RecursiveObject;
				let baseObject = lang;
				const keys = file
					.split(".")
					.slice(0, -1)
					.join(".")
					.split("/")
					.filter((f) => !f.startsWith("_"));

				for (const key of keys) {
					baseObject[key] ??= {};
					baseObject = baseObject[key] as RecursiveObject;
				}

				Object.assign(baseObject, parsed);
			}

			return lang;
		};

		for (const locale of locales) {
			const data = await createLangDataFromLocale(locale);

			langData[locale] = data;
		}

		return langData;
	}
}
