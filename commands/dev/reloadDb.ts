import { Command, CommandContext, Embed } from 'harmony';
import { Database } from "database"

export class command extends Command {
	name = 'reloaddb';
    aliases = ['rldb'];
	ownerOnly = true;
	category = 'dev';
	description = 'Reload database';
	usage = 'reloaddb';
	async execute(ctx: CommandContext) {
		const message = await ctx.message.reply(undefined, {
            embed: new Embed({
                author: {
                    name: 'Bidome bot',
                    icon_url: ctx.message.client.user?.avatarURL(),
                },
                title: 'Bidome Eco',
                description: 'Reloading database...',
            }).setColor('random'),
        });
        await Database.reload();
        await message.edit(undefined, {
            embed: new Embed({
                author: {
                    name: 'Bidome bot',
                    icon_url: ctx.message.client.user?.avatarURL(),
                },
                title: 'Bidome Eco',
                description: 'Database reloaded!',
            }).setColor('random'),
        });
	}
}
