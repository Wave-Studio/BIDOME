import { Command, CommandContext, Embed, User } from 'harmony';
import { getProfileFromDatabase } from "eco";

export class command extends Command {
    name = 'bal';
    aliases = ['balance'];
    description = 'Check your balance.';
    async execute(ctx: CommandContext) {
        let user = ctx.author;
        if (await ctx.message.mentions.users.first() != undefined) {
            user = await ctx.message.mentions.users.first() as User;
        }
        if (user.bot) {
            return await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome Eco',
					description: `Bot's can't have a balance!`,
				}).setColor('random'),
			});
        } else {
            const userProfile = await getProfileFromDatabase(user.id);
            await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'User balance',
					fields: [
                        {
                            name: 'Balance',
                            value: `$${userProfile.balance}`,
                        }
                    ]
				}).setColor('random'),
			});
        }
    }
}