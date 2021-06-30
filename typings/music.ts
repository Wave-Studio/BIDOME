import { Player } from "lavalink";

export interface GuildQueue {
    dj: string;
    songs: Song[];
    player: Player
}

export interface Song {
    name: string;
    image: string;
    requestedBy: string;
    url: string;
    secondLength: number;
}