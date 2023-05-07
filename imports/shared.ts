import {
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "./harmony.ts";
import { loopFilesAndReturn } from "./tools.ts";

export let buttonInteractionHandlers: ((
	i: MessageComponentInteraction
) => Promise<boolean | void>)[] = [];

export let modalInteractionHandlers: ((
	i: ModalSubmitInteraction
) => Promise<boolean | void>)[] = [];

export const clearInteractions = () => {
	buttonInteractionHandlers = [];
	modalInteractionHandlers = [];
}

export const loadInteractions = async () => {
	for (const int of await loopFilesAndReturn("./interactions/")) {
		const interaction = await import(`.${int}#${Date.now()}`);
		if (interaction.button == undefined && interaction.modal == undefined) {
			console.log(`Interaction ${int} has no valid exports! Skipping...`);
			continue;
		}

		if (interaction.button != undefined) {
			buttonInteractionHandlers.push(interaction.button);
		}

		if (interaction.modal != undefined) {
			modalInteractionHandlers.push(interaction.modal);
		}
	}
}