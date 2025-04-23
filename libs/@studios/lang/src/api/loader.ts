export type Arrayable<T> = T | T[];

export interface RecursiveObject {
	[key: string]:
		| Arrayable<string | number | boolean | string>
		| RecursiveObject;
}

export interface LoadedLanguageOutput {
	[locale: string]: RecursiveObject;
}

/**
 * This class is for developers only, do not use this for loading languages
 * @see YamlLoaderPlugin from "@studios/lang/loaders/yaml.ts"
 * @see JsonLoaderPlugin from "@studios/lang/loaders/json.ts"
 */
export class LoaderPlugin {
	/**
	 * Loader plugin for language files, files and folders prefixed with - will be ignored and files/folders prefixed with _ will not have their name added to the key
	 * @param filePathBase This is the base path for the folders in a `[locale-REGION]/*` format
	 * @param [defaultLocale="en-US"] The default locale to use as the fallback for the language
	 */
	constructor(public folderBase: string) {}

	// deno-lint-ignore require-await no-unused-vars
	public async load(defaultLocale = "en-US"): Promise<LoadedLanguageOutput> {
		return {};
	}
}
