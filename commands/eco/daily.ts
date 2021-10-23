import { Command, CommandContext, Embed } from 'harmony';
import { getProfileFromDatabase, saveProfile } from "eco";
import { formatMs, getRandomInteger } from "tools";

export class command extends Command {
    name = 'daily';
    aliases = ['d'];
    description = 'Claim your daily coins';
    async execute(ctx: CommandContext) {
        const profile = await getProfileFromDatabase(ctx.author.id);
        if (profile.lastDailyClaim) {
            const time = profile.lastDailyClaim + (60 * 1000) * 60 * 24
            if (time > Date.now()) {
                return await ctx.message.reply(undefined, {
                    embed: new Embed({
                        author: {
                            name: 'Bidome bot',
                            icon_url: ctx.message.client.user?.avatarURL(),
                        },
                        title: 'Daily',
                        description: `You need to wait ${formatMs(time - Date.now())}`,
                    }).setColor('random'),
                });
            }
        }
        const added = getRandomInteger(80, 120)
        profile.balance += added;
        profile.lastDailyClaim = Date.now();
        saveProfile(profile);
        await ctx.message.reply(undefined, {
            embed: new Embed({
                author: {
                    name: 'Bidome bot',
                    icon_url: ctx.message.client.user?.avatarURL(),
                },
                title: 'Daily',
                description: `You have received $${added}`,
            }).setColor('random'),
        });
    }
}