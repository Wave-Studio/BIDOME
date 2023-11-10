export * from "https://raw.githubusercontent.com/harmonyland/harmony/e3e3c73056b1980ee214d7047aa2d104c515f737/mod.ts";

import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
//export * from "../../harmony/mod.ts";
