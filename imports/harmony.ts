export * from "https://raw.githubusercontent.com/harmonyland/harmony/5d3cf6dff35ed56df91ef55a084be0508f23b309/mod.ts";
import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
//export * from "../../harmony/mod.ts";
