import type { LoadedLanguage } from "../lang.ts";

/**
 * This class is for developers only, you can add custom formatters to handle objects being passed to formatting
 */

export class FormatterPlugin<T> {
	/**
	 * Instance of loaded language, is injected before every request
	 */
	public loadedLanguageClass!: LoadedLanguage<T>;

	/** The types that should be checked with this plugin, will skip unsupported types */
	public validVarTypes: (
		| "bigint"
		| "boolean"
		| "function"
		| "number"
		| "object"
		| "string"
		| "symbol"
		| "undefined"
		// This type is a custom one not returned by typeof that we'll support - Bloxs
		| "array"
	)[] = [];

	/**
	 * Returns if the variable is formattable by this plugin
	 * @param input The variable passed to LoadedLanguage#get
	 * @param usedVariable the full variable name used in the string, e.g. `{0:optionalModifier}`
	 */
	// deno-lint-ignore no-unused-vars
	public isFormattable(input: unknown, usedVariable: string): boolean {
		return false;
	}

	/**
	 * Formats the variable to a string
	 * @param input The variable passed to LoadedLanguage#get
	 * @param usedVariable the full variable name used in the string, e.g. `{0:optionalModifier}`
	 */
	// deno-lint-ignore no-unused-vars
	public format(input: unknown, usedVariable: string): string {
		return String(input);
	}
}
