export interface LiveList {
	kind: "youtube#searchListResponse";
	etag: string;
	regionCode: string;

	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};

	items: {
		kind: "youtube#searchResult";
		etag: string;
		id: {
			kind: "youtube#video";
			videoId: string;
		};
	}[];
}

export interface LiveInfo {
	kind: "youtube#videoListResponse";
	etag: string;

	items: {
		kind: "youtube#video";
		etag: string;
		id: string;

		liveStreamingDetails: {
			/** Date in string format */
			actualStartTime: string;
			/** Number in string format */
			concurrentViewers: string;
			activeLiveChatId: string;
		};
	}[];

	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};
}

// {
// 	"kind": "youtube#liveChatMessage",
// 	"etag": etag,
// 	"id": string,
// 	"snippet": {
// 	  "type": string,
// 	  "liveChatId": string,
// 	  "authorChannelId": string,
// 	  "publishedAt": datetime,
// 	  "hasDisplayContent": boolean,
// 	  "displayMessage": string,
// 	  "fanFundingEventDetails": {
// 		"amountMicros": unsigned long,
// 		"currency": string,
// 		"amountDisplayString": string,
// 		"userComment": string
// 	  },
// 	  "textMessageDetails": {
// 		"messageText": string
// 	  },
// 	  "messageDeletedDetails": {
// 		"deletedMessageId": string
// 	  },
// 	  "userBannedDetails": {
// 		"bannedUserDetails": {
// 		  "channelId": string,
// 		  "channelUrl": string,
// 		  "displayName": string,
// 		  "profileImageUrl": string
// 		},
// 		"banType": string,
// 		"banDurationSeconds": unsigned long
// 	  },
// 	  "memberMilestoneChatDetails": {
// 		"userComment": string,
// 		"memberMonth": unsigned integer,
// 		"memberLevelName": string
// 	  },
// 	  "newSponsorDetails": {
// 		"memberLevelName": string,
// 		"isUpgrade": bool
// 	  },
// 	  "superChatDetails": {
// 		"amountMicros": unsigned long,
// 		"currency": string,
// 		"amountDisplayString": string,
// 		"userComment": string,
// 		"tier": unsigned integer
// 	  },
// 	  "superStickerDetails": {
// 		"superStickerMetadata": {
// 		  "stickerId": string,
// 		  "altText": string,
// 		  "language": string
// 		},
// 		"amountMicros": unsigned long,
// 		"currency": string,
// 		"amountDisplayString": string,
// 		"tier": unsigned integer
// 	  },
// 	  "membershipGiftingDetails": {
// 		"giftMembershipsCount": integer,
// 		"giftMembershipsLevelName": string
// 	  },
// 	  "giftMembershipReceivedDetails": {
// 		"memberLevelName": string,
// 		"gifterChannelId": string,
// 		"associatedMembershipGiftingMessageId": string
// 	  }
// 	},
// 	"authorDetails": {
// 	  "channelId": string,
// 	  "channelUrl": string,
// 	  "displayName": string,
// 	  "profileImageUrl": string,
// 	  "isVerified": boolean,
// 	  "isChatOwner": boolean,
// 	  "isChatSponsor": boolean,
// 	  "isChatModerator": boolean
// 	}
//   }

export interface LiveChat {
	kind: "youtube#liveChatMessageListResponse";
	etag: string;
	pollingIntervalMillis: number;

	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};

	nextPageToken: string;

	items: {
		kind: "youtube#liveChatMessage";
		etag: string;
		id: string;

		snippet: LiveChatMessageEvent | LiveSponsor | LiveSponsorMilestone;
		authorDetails: LiveChatMessageAuthor;
		superChatDetails?: LiveSuperChat;
	}[];
}

export interface LiveChatMessageEvent {
	type: "textMessageEvent";
	liveChatId: string;
	authorChannelId: string;
	/** Date in string format */
	publishedAt: string;
	hasDisplayContent: boolean;
	displayMessage: string;

	textMessageDetails: {
		messageText: string;
	};
}

export interface LiveSponsor {
	type: "newSponsorEvent";
	liveChatId: string;
	authorChannelId: string;
	/** Date in string format */
	publishedAt: string;
	hasDisplayContent: boolean;
	displayMessage: string;

	newSponsorDetails: {
		memberLevelName: string;
	};
}

export interface LiveSponsorMilestone {
	type: "memberMilestoneChatEvent";
	liveChatId: string;
	authorChannelId: string;
	/** Date in string format */
	publishedAt: string;
	hasDisplayContent: boolean;
	displayMessage: string;

	memberMilestoneChatDetails: {
		memberLevelName: string;
		memberMonth: number;
		userComment: string;
	};
}

export interface LiveChatMessageAuthor {
	channelId: string;
	channelUrl: string;
	displayName: string;
	profileImageUrl: string;
	isVerified: boolean;
	isChatOwner: boolean;
	isChatSponsor: boolean;
	isChatModerator: boolean;
}

export interface LiveSuperChat {
	amountMicros: string;
	currency: string;
	amountDisplayString: string;
	userComment: string;
	tier: number;
}
