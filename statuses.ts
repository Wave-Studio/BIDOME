import { ActivityType, CommandClient, StatusType } from "harmony";

export interface BotStatus {
	name: string;
	type: ActivityType;
	status?: StatusType;
}

export const getRandomStatus = async (bot: CommandClient) => {
	const statuses: BotStatus[] = [
		{
			name: `!help in ${await bot.guilds.size()} servers`,
			type: "WATCHING",
		},
		{
			name: `!status`,
			type: "WATCHING",
		},
		{
			name: `American presindetio joe bi-`,
			type: "PLAYING",
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
	return statuses[Math.floor(Math.random() * statuses.length)];
};
