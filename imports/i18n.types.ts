export interface LanguageFile {
	language: {
		short: string;
		full: string;
	};

	generic: {
		ownerOnly: string;
		noPerms: string;
		noDescription: string;
		noUsage: string;
		noCategory: string;
	};

	commands: {
		help: {
			unknownCommand: GenericReplyEmbed;
			commandInfo: {
				title: string;
				field: {
					name: string;
					value: string[];
				}
				footer: string;
			}
		};
	};

	interactions: Record<string, unknown>;

	errors: {
		genericCommand: GenericReplyEmbed;
		missingPerms: GenericReplyEmbed;
	};
}

export interface GenericReplyEmbed {
	title: string;
	description: string;
}
