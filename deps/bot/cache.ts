try {
	await Deno.mkdir("./.cache");
} catch {
	// Unimportant error so we ignore it - Bloxs
}

const dataVersion = "alyx";

try {
	const json = JSON.parse(await Deno.readTextFile("./.cache/data.json"));
	if (json.dataVersion !== dataVersion) {
		console.log("Cache is on an invalid version, resetting cache");
		await Deno.remove("./.cache", { recursive: true });
		await Deno.mkdir("./.cache");
		throw new Error("Invalid cache version");
	}
} catch {
	const cacheData: Cache = {
		dataVersion,
		discord: {
			emojis: {},
			files: {
				banners: {},
				guilds: {},
				users: {},
				emojis: [],
				stickers: [],
			},
		},
		guilded: {
			files: {
				attachments: [],
				emotes: [],
				team: {
					avatars: [],
					banners: [],
				},
				user: {
					avatars: [],
					banners: [],
				},
			},
		},
	};

	await Deno.writeTextFile("./.cache/data.json", JSON.stringify(cacheData));
}

interface Cache {
	dataVersion: typeof dataVersion;

	discord: {
		files: {
			users: {
				[user: string]: {
					avatar?: string;
				};
			};

			guilds: {
				[guild: string]: {
					attachments: {
						[attachmentId: string]: string;
					};

					/** Value is emote id */
					emojis: string[];

					users: {
						[user: string]: {
							avatar?: string;
							banner?: string;
						};
					};

					banner?: string;
					avatar?: string;
				};
			};

			// Because discord is dumb and keeps server & user banners in the same path - Bloxs
			banners: {
				[id: string]: string;
			};

			/** Emoji ID */
			emojis: string[];

			/** Sticker ID */
			stickers: string[];
		};

		emojis: {
			/** Key is image url */
			[emojiID: string]: {
				name: string;
				animated: boolean;
				available: boolean;
			};
		};
	};

	guilded: {
		files: {
			// TeamAvatar
			// TeamBanner
			team: {
				/** File Hash */
				avatars: string[];
				/** File Hash */
				banners: string[];
			};

			// UserAvatar
			// UserBanner
			user: {
				/** File Hash */
				avatars: string[];
				/** File Hash */
				banners: string[];
			};

			// CustomReaction
			/** File Hash */
			emotes: string[];

			// ContentMediaGenericFiles
			/** File Hash */
			attachments: string[];
		};
	};
}

const cache: Cache = JSON.parse(await Deno.readTextFile("./.cache/data.json"));

export const saveNewCache = async () => {
	// An argument could be made for backing up the previous data file but given it's a cache I don't think it's necessary
	// The cache would just get nuked if it's corrupted anyways - Bloxs
	await Deno.writeTextFile("./.cache/data.json", JSON.stringify(cache));
};

export const getImage = async (urlString: string) => {
	const url = new URL(urlString);
	const host = url.hostname.toLowerCase();
	const path = url.pathname;

	switch (host) {
		case "media.discordapp.net":
		case "cdn.discordapp.com": {
			const [_, globalType, ...pathRemains] = path.split("/");

			switch (globalType) {
				case "guilds": {
					const [guildId, __, userId, imageType, hash] = pathRemains;

					cache.discord.files.guilds ??= {};
					cache.discord.files.guilds[guildId] ??= {
						attachments: {},
						emojis: [],
						users: {},
					};
					cache.discord.files.guilds[guildId].users ??= {};

					const currentValue = cache.discord.files.guilds[guildId]
						.users![userId]
						?.[
							imageType == "avatars" ? "avatar" : "banner"
						] as string | undefined;

					if (currentValue == undefined || currentValue != hash) {
						const image = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(
								`./.cache/discord/users/${guildId}/${userId}/${imageType}`,
								{
									recursive: true,
								},
							);
						} catch {
							// Ignore
						}

						await Deno.writeFile(
							`./.cache/discord/users/${guildId}/${userId}/${imageType}/${hash}`,
							new Uint8Array(image),
						);

						if (currentValue != undefined) {
							await Deno.remove(
								`./.cache/discord/users/${guildId}/${userId}/${imageType}/${currentValue}`,
							);
						}

						cache.discord.files.guilds[guildId].users![userId] ??=
							{};
						cache.discord.files.guilds[guildId].users![userId][
							imageType == "avatars" ? "avatar" : "banner"
						] = hash;
						await saveNewCache();
					}

					return await Deno.readFile(
						`./.cache/discord/users/${guildId}/${userId}/${imageType}/${hash}`,
					);
				}

				case "emojis":
				case "stickers": {
					const [id] = pathRemains;

					cache.discord.files[globalType] ??= [];

					if (
						cache.discord.files[globalType].find((v) => v == id) ==
							undefined
					) {
						const image = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(`./.cache/discord/${globalType}`, {
								recursive: true,
							});
						} catch {
							// Ignore as it's not important - Bloxs
						}

						await Deno.writeFile(
							`./.cache/discord/${globalType}/${id}`,
							new Uint8Array(image),
						);

						cache.discord.files[globalType].push(id);
						await saveNewCache();
					}

					break;
				}

				case "attachments": {
					const [guildId, id, attachment] = pathRemains;

					cache.discord.files.guilds ??= {};
					cache.discord.files.guilds[guildId] ??= {
						attachments: {},
						emojis: [],
						users: {},
					};
					cache.discord.files.guilds[guildId].attachments ??= {};

					if (
						cache.discord.files.guilds[guildId].attachments[id] ==
							undefined ||
						cache.discord.files.guilds[guildId].attachments[id] !=
							attachment
					) {
						const file = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(
								`./.cache/discord/attachments/${guildId}/${id}`,
								{
									recursive: true,
								},
							);
						} catch {
							// Ignore as it's not important - Bloxs
						}

						await Deno.writeFile(
							`./.cache/discord/attachments/${guildId}/${id}/${attachment}`,
							new Uint8Array(file),
						);

						if (
							cache.discord.files.guilds[guildId]
								.attachments[id] != undefined
						) {
							await Deno.remove(
								`./.cache/discord/attachments/${guildId}/${
									cache.discord.files.guilds[guildId]
										.attachments[id]
								}`,
							);
						}

						cache.discord.files.guilds[guildId].attachments[id] =
							attachment;
						await saveNewCache();
					}

					return await Deno.readFile(
						`./.cache/discord/attachments/${guildId}/${id}/${attachment}`,
					);
				}

				case "banners":
				case "channel-icons": {
					const [id, hash] = pathRemains;

					cache.discord.files.banners ??= {};

					if (
						cache.discord.files.banners[id] == undefined ||
						cache.discord.files.banners[id] != hash
					) {
						const file = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(`./.cache/discord/banners/${id}`, {
								recursive: true,
							});
						} catch {
							// Ignore
						}

						await Deno.writeFile(
							`./.cache/discord/banners/${id}/${hash}`,
							new Uint8Array(file),
						);

						if (cache.discord.files.banners[id] != undefined) {
							await Deno.remove(
								`./.cache/discord/banners/${id}/${
									cache.discord.files.banners[id]
								}`,
							);
						}

						cache.discord.files.banners[id] = hash;
						await saveNewCache();
					}

					return await Deno.readFile(
						`./.cache/discord/banners/${id}/${hash}`,
					);
				}

				case "icons":
				case "avatars": {
					const [id, hash] = pathRemains;
					const type = globalType == "icons" ? "guilds" : "users";

					cache.discord.files[type] ??= {};

					if (
						cache.discord.files[type][id] == undefined ||
						cache.discord.files[type][id].avatar != hash
					) {
						const file = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(`./.cache/discord/${type}/${id}`, {
								recursive: true,
							});
						} catch {
							// Ignore as it's not important - Bloxs
						}

						await Deno.writeFile(
							`./.cache/discord/${type}/${id}/${hash}`,
							new Uint8Array(file),
						);

						if (cache.discord.files[type][id].avatar != undefined) {
							await Deno.remove(
								`./.cache/discord/${type}/${id}/${
									cache.discord.files[type][id].avatar
								}`,
							);
						}

						cache.discord.files[type][id] ??= {};
						cache.discord.files[type][id].avatar = hash;
						await saveNewCache();
					}

					return await Deno.readFile(
						`./.cache/discord/${type}/${id}/${hash}`,
					);
				}

				default: {
					throw new Error("Unknown discord image type " + globalType);
				}
			}

			break;
		}

		// img.guildedcdn.com used to be a valid cdn link but it looks like guilded has migrated to a new url - Bloxs
		case "cdn.gilcdn.com": {
			const [_, type, filehash] = path.split("/");

			switch (type) {
				case "CustomReaction":
				case "ContentMediaGenericFiles": {
					const category = type == "CustomReaction"
						? "emotes"
						: "attachments";
					cache.guilded
						.files[category as "emotes" | "attachments"] ??= [];

					const currentValue = cache.guilded.files[
						category as "emotes" | "attachments"
					]!.find((v) => v == filehash);

					if (currentValue == undefined) {
						const image = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(`./.cache/guilded/${category}`, {
								recursive: true,
							});
						} catch {
							// Ignore
						}

						await Deno.writeFile(
							`./.cache/guilded/${category}/${filehash}`,
							new Uint8Array(image),
						);

						cache.guilded
							.files[category as "emotes" | "attachments"]!.push(
								filehash,
							);

						await saveNewCache();
					}

					return await Deno.readFile(
						`./.cache/guilded/${category}/${filehash}`,
					);
				}

				case "TeamAvatar":
				case "TeamBanner":
				case "UserAvatar":
				case "UserBanner": {
					const category = type.substring(0, 4).toLowerCase();
					const imageType = type.substring(4).toLowerCase();

					cache.guilded.files[category as "team" | "user"] ??= {
						avatars: [],
						banners: [],
					};

					const currentValue = cache.guilded.files[
						category as "team" | "user"
					]![imageType as "avatars" | "banners"].find((v) =>
						v == filehash
					);

					if (currentValue == undefined) {
						const image = await (await fetch(urlString))
							.arrayBuffer();

						try {
							await Deno.mkdir(
								`./.cache/guilded/${category}/${imageType}`,
								{
									recursive: true,
								},
							);
						} catch {
							// Ignore as it's not important - Bloxs
						}

						await Deno.writeFile(
							`./.cache/guilded/${category}/${imageType}/${filehash}`,
							new Uint8Array(image),
						);

						cache.guilded.files[category as "team" | "user"]![
							imageType as "avatars" | "banners"
						].push(filehash);

						await saveNewCache();
					}

					return await Deno.readFile(
						`./.cache/guilded/${category}/${imageType}/${filehash}`,
					);
				}

				default: {
					throw new Error("Unknown guilded image type " + type);
				}
			}

			// Deno TS doesn't like this being here as it's unreachable
			// But removing it throws an error about fallthrough so I'm just going to leave it - Bloxs
			break;
		}

		default: {
			throw new Error("Unknown image host " + host);
		}
	}
};
