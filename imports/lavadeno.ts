export * from "https://deno.land/x/lavadeno@3.2.3/mod.ts";

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
