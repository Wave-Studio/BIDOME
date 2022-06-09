import { TimeUnit } from "tools";

export interface Job {
	id: number;
	name: string;
	cooldown: number;
	aliases: string[];
	description: string;
	salary: {
		min: number;
		max: number;
	};
	requiredLevel: number;
}

export const jobs: Job[] = [
	{
		id: 1,
		name: "Moderator",
		cooldown: TimeUnit.HOUR,
		aliases: ["discordmod", "discordmoderator", "mod", "dmod"],
		description: "Discord server moderator.",
		requiredLevel: 1,
		salary: {
			min: 100,
			max: 200,
		},
	},
];
