import { LiveChat, LiveInfo, LiveList } from "./types/index.ts";
import {
	LIVE_CHAT_MESSAGES,
	LIVE_INFO,
	LIVE_LIST,
	SEND_LIVE_CHAT_MESSAGE,
} from "./routes.ts";

export class YoutubeLiveAPI {
	// @ts-expect-error Assigned later
	private channelID: string;
	/** Will only be undefined if you load via fromChatID */
	// @ts-expect-error Assigned later
	private videoID: string;
	// @ts-expect-error Assigned later
	private liveChatID: string;

	constructor(private apiKey: string) {}

	private async fetch<T>(url: string) {
		const res = await fetch(url, {
			headers: {
				Accept: "application/json",
			},
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		return (await res.json()) as T;
	}

	public async fromChannelID(channelID: string) {
		this.channelID = channelID;

		const liveList = await this.fetch<LiveList>(
			LIVE_LIST(this.apiKey, channelID),
		);
		this.channelID = liveList.items[0].id.videoId;
		this.videoID = liveList.items[0].id.videoId;

		await this.fromVideoID(this.videoID);

		return this;
	}

	public async fromVideoID(videoID: string) {
		this.videoID = videoID;

		const liveInfo = await this.fetch<LiveInfo>(
			LIVE_INFO(this.apiKey, videoID),
		);
		this.liveChatID =
			liveInfo.items[0].liveStreamingDetails.activeLiveChatId;

		return this;
	}

	public fromChatID(liveChatID: string) {
		this.liveChatID = liveChatID;

		return this;
	}

	// It may be worth investigating if we can use websockets rather than polling due to api limits - Bloxs

	public async fetchChatMessages(
		messageID: string | undefined = undefined,
		maxResults = 200,
	) {
		const messages = await this.fetch<LiveChat>(
			LIVE_CHAT_MESSAGES(this.apiKey, this.liveChatID, maxResults),
		);

		if (messageID === undefined) {
			return messages;
		}

		const index = messages.items.findIndex(
			(message) => message.id === messageID,
		);

		if (index === -1) {
			return {
				...messages,
				items: [],
			};
		}

		return {
			...messages,
			items: messages.items.slice(0, index),
		};
	}

	public async sendMessage(message: string) {
		// TODO: https://developers.google.com/youtube/v3/live/docs/liveChatMessages - Bloxs

		const _res = await fetch(SEND_LIVE_CHAT_MESSAGE(this.apiKey), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				liveChatId: this.liveChatID,
				type: "textMessageEvent",
				textMessageDetails: {
					messageText: message,
				},
			}),
		});

		return this;
	}
}
