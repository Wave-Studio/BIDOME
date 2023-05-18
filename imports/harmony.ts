export * from "https://raw.githubusercontent.com/harmonyland/harmony/daca400ae9feab19604381abddbdab16aa1ede2b/mod.ts";
import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
// export * from "../../harmony/mod.ts";
