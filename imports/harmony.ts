export * from "https://raw.githubusercontent.com/harmonyland/harmony/04bbcfc6d6afc79d72ad2b44b38f4c27c2854d06/mod.ts";

import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
//export * from "../../harmony/mod.ts";
