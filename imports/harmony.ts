export * from "https://raw.githubusercontent.com/harmonyland/harmony/824e70c16efc4688a83a6c1a18b386a4df7ce8f3/mod.ts";

import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
// export * from "../../harmony/mod.ts";
