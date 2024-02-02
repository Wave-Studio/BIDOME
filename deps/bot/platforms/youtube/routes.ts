export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
export const LIVE_LIST = (apiKey: string, channelID: string) =>
	`${YOUTUBE_API_BASE}/search?eventType=live&part=id&channelId=${channelID}&type=video&key=${apiKey}`;
export const LIVE_INFO = (apiKey: string, videoID: string) =>
	`${YOUTUBE_API_BASE}/videos?part=liveStreamingDetails&id=${videoID}&key=${apiKey}`;
export const LIVE_CHAT_MESSAGES = (
	apiKey: string,
	liveChatID: string,
	maxResults = 200,
) => `${YOUTUBE_API_BASE}/liveChat/messages?liveChatId=${liveChatID}&part=id,snippet,authorDetails&maxResults=${maxResults}&key=${apiKey}`;
export const SEND_LIVE_CHAT_MESSAGE = (apiKey: string) =>
	`${YOUTUBE_API_BASE}/liveChat/messages?part=snippet&key=${apiKey}`;
