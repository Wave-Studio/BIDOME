import { Player } from 'lavadeno';
import { Message } from 'harmony';

export interface GuildQueue {
	startedby: string;
	connection: Player;
	channel: string;
	songs: Song[];
	voteskip: string[];
	message: Message | null;
}

export interface Song {
	name: string;
	image: string | null;
	requestedBy: string;
	url: string;
	secondLength: number;
	track: string;
}
