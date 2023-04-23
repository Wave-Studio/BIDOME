export * from "https://raw.githubusercontent.com/lavaclient/lavadeno/22c88554cfc6f06dee7838eca0b00960cf47477a/mod.ts";

// Non exported types

export enum LoadType {
	/**
	 * A single track was loaded.
	 */
	TrackLoaded = "TRACK_LOADED",

	/**
	 * A playlist was loaded.
	 */
	PlaylistLoaded = "PLAYLIST_LOADED",

	/**
	 * A search result was made, either with `ytsearch:` or `scsearch:`.
	 */
	SearchResult = "SEARCH_RESULT",

	/**
	 * Nothing was founded for the supplied identifier.
	 */
	NoMatches = "NO_MATCHES",

	/**
	 * Lavaplayer failed to load something.
	 */
	LoadFailed = "LOAD_FAILED",
}

export enum TrackEndReason {
	/**
	 * This means the track itself emitted a terminator. This is usually caused by the track reaching the end,
	 * however it will also be used when it ends due to an exception.
	 */
	Finished = "FINISHED",

	/**
	 * This means that the track failed to start, throwing an exception before providing any audio.
	 */
	LoadFailed = "LOAD_FAILED",

	/**
	 * The track was stopped due to the player being stopped by the "stop" operation.
	 */
	Stopped = "STOPPED",

	/**
	 * The track stopped playing because a new track started playing. Note that with this reason, the old track will still
	 * play until either it's buffer runs out or audio from the new track is available.
	 */
	Replaced = "REPLACED",

	/**
	 * The track was stopped because the cleanup threshold for the audio player has reached. This triggers when the amount
	 * of time passed since the last frame fetch has reached the threshold specified in the player manager.
	 * This may also indicate either a leaked audio player which has discarded, but not stopped.
	 */
	Cleanup = "CLEANUP",
}

/**
 * A base64 encoded track, due to lavalink being developed in java it cannot be decoded "normally".
 *
 * @see https://www.npmjs.com/package/@lavalink/encoding
 */
export type EncodedTrack = string;

export interface TrackInfo {
	identifier: string;
	isStream: boolean;
	isSeekable: boolean;
	author: string;
	length: number;
	position: number;
	title: string;
	uri: string;
	sourceName: string;
}

export interface Track {
	track: EncodedTrack;
	info: TrackInfo;
}
