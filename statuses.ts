import { CommandClient, ActivityType, StatusType } from "harmony";

export interface BotStatus {
    name: string;
    type: ActivityType,
    status?: StatusType 
}

export const getRandomStatus = async (bot: CommandClient) => {
    const statuses: BotStatus[] = [
        {
            name: `!help in ${await bot.guilds.size()} servers`,
            type: 'WATCHING'
        },
        {
            name: `!status`,
            type: 'WATCHING'
        },
        {
            name: `people meme Bidome`,
            type: 'WATCHING'
        },
        {
            name: `Biden say "malarkey"`,
            type: 'WATCHING'
        },
        {
            name: `The end of 2021 approach 👀`,
            type: 'WATCHING'
        },
        {
            name: 'The next wave of Covid',
            type: 'WATCHING'
        },
        {
            name: 'MrBeast\'s Squid Game',
            type: 'COMPETING'
        }
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
}