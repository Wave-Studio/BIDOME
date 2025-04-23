import type {
	LoadedLanguageOutput,
	LoaderPlugin,
	RecursiveObject,
} from "./api/loader.ts";
import type { FormatterPlugin } from "./api/formatter.ts";

class Language<T> {
	constructor(public defaultLang: string = "en-US") {}

	/**
	 * @param plugin The plugin to use for language loading
	 */
	public async load(
		languagePlugin: LoaderPlugin,
		formatterPlugins: FormatterPlugin<T>[] = [],
	): Promise<LoadedLanguage<T>> {
		const data = await languagePlugin.load(this.defaultLang);

		return new LoadedLanguage<T>(data, this.defaultLang, formatterPlugins);
	}

	/**
	 * Gives you the ability to load a language file via an object rather than using a loader plugin.
	 *
	 * This is primairly to be used on websites where you don't have access to the filesystem and instead inject the language data directly
	 * @param data The data for your language
	 */
	public loadObject(data: LoadedLanguageOutput): LoadedLanguage<T> {
		return new LoadedLanguage<T>(data, this.defaultLang);
	}
}

class LoadedLanguage<T> {
	constructor(
		private langData: LoadedLanguageOutput,
		private locale: string,
		private formatterPlugins: FormatterPlugin<T>[] = [],
		private fallbackLocale?: string,
	) {
		this.fallbackLocale ??= locale;
	}

	/**
	 * @param locale The locale to default to for all requests chained off this object.
	 */
	public load(locale: string): LoadedLanguage<T> {
		return new LoadedLanguage<T>(
			this.langData,
			locale,
			this.formatterPlugins,
			this.fallbackLocale,
		);
	}

	/**
	 * The variable formatter used in #get to format the string. Plugins can access this if they'd like
	 */
	public format(str: string, ...variables: unknown[]): string {
		return str.replace(/{\d+(:.*)?}/g, (replace) => {
			const index = Number(
				replace.substring(
					1,
					replace.includes(":")
						? replace.indexOf(":")
						: replace.length - 1,
				),
			);

			if (isNaN(index) || variables[index] === undefined) {
				return replace;
			}

			for (const plugin of this.formatterPlugins) {
				if (
					plugin.validVarTypes.includes(
						Array.isArray(variables[index])
							? "array"
							: typeof variables[index],
					)
				) {
					plugin.loadedLanguageClass = this;

					if (plugin.isFormattable(variables[index], replace)) {
						return plugin.format(variables[index], replace);
					}
				}
			}

			return String(variables[index]);
		});
	}

	public get<T = RecursiveObject | string>(
		key: string,
		...variables: unknown[]
	): T {
		const lang = this.langData[this.locale] ??
			this.langData[this.fallbackLocale!];

		if (!lang) {
			throw new Error(
				`Language ${this.locale} not found along with fallback ${this.fallbackLocale}`,
			);
		}

		let data = lang;

		for (const part of key.split(".").slice(0, -1)) {
			if (data[part] === undefined) {
				if (this.locale == this.fallbackLocale) {
					throw new Error(
						`Key ${key} not found in language ${this.locale}`,
					);
				} else {
					return this.load(this.fallbackLocale!).get<T>(
						key,
						...variables,
					);
				}
			}
			data = data[part] as RecursiveObject;
		}

		const finalKey = key.split(".").pop()!;

		if (typeof data[finalKey] == "string") {
			data[finalKey] = this.format(data[finalKey], ...variables);
		}

		return data[finalKey] as T;
	}

	public set(key: string, value: string) {
		const lang = this.langData[this.locale] ??
			this.langData[this.fallbackLocale!];

		if (!lang) {
			throw new Error(
				`Language ${this.locale} not found along with fallback ${this.fallbackLocale}`,
			);
		}

		let data = lang;

		for (const part of key.split(".").slice(0, -1)) {
			data[part] ??= {};
			data = data[part] as RecursiveObject;
		}

		data[key.split(".").pop()!] = value;
	}

	public has(key: string): boolean {
		const lang = this.langData[this.locale] ??
			this.langData[this.fallbackLocale!];

		if (!lang) {
			throw new Error(
				`Language ${this.locale} not found along with fallback ${this.fallbackLocale}`,
			);
		}

		let data = lang;

		for (const part of key.split(".").slice(0, -1)) {
			if (data[part] === undefined) {
				return false;
			}
			data = data[part] as RecursiveObject;
		}

		return data[key.split(".").pop()!] !== undefined;
	}

	public delete(key: string): boolean {
		const lang = this.langData[this.locale] ??
			this.langData[this.fallbackLocale!];

		if (!lang) {
			throw new Error(
				`Language ${this.locale} not found along with fallback ${this.fallbackLocale}`,
			);
		}

		let data = lang;

		for (const part of key.split(".").slice(0, -1)) {
			if (data[part] === undefined) {
				return false;
			}
			data = data[part] as RecursiveObject;
		}

		return delete data[key.split(".").pop()!];
	}
}

export { Language, type LoadedLanguage };
