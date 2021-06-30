import { Command, CommandContext, Embed } from "harmony";

const data = (await import("./join.ts"))

export const queue = data.queue
export const lavalink = data.lavalink

export class command extends Command {
    name = 'play';
    description = 'Play a song';
    category = 'music';
    usage = 'Play <song name or url>';
    async execute(ctx: CommandContext) {
        
    }
}