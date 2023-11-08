export * from "https://raw.githubusercontent.com/harmonyland/harmony/e504976fdc155c17af0e1f29df4cf3c10d8297e9/mod.ts";

import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
//export * from "../../harmony/mod.ts";
