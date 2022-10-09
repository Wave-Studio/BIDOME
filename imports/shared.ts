import { MessageComponentInteraction } from "./harmony.ts";

export const interactionHandlers: ((
	i: MessageComponentInteraction
) => Promise<boolean | void>)[] = [];
