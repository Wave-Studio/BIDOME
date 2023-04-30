import { ActivityType, CommandClient } from "harmony";

export interface BotStatus {
	name: string;
	type: ActivityType;
}

let statusIndex = 0;

export const getRandomStatus = async (bot: CommandClient) => {
	const statuses: BotStatus[] = [
		{
			name: `!help in ${await bot.guilds.size()} servers`,
			type: "WATCHING",
		},
		{
			name: `American presindetio joe bi-`,
			type: "WATCHING",
		},
		{
			name: `!status`,
			type: "WATCHING",
		},
		{
			name: `people meme Bidome`,
			type: "WATCHING",
		},
		{
			name: "H",
			type: "PLAYING",
		}
	];

	if (statusIndex >= statuses.length) {
		statusIndex = 0;
	}

	return statuses[statusIndex];
};
