import { createClient } from "https://esm.sh/@supabase/supabase-js@2.12.1";

export * from "https://esm.sh/@supabase/supabase-js@2.12.1";

// Yes, this is the same loader as in nodes.ts, but for some reason env isn't set when accessing here
const envfile = (await Deno.readTextFile(".env")).split("\n");

for (const line of envfile) {
	const [key, ...value] = line.split("=");
	if (key.trim() == "" || key.startsWith("#")) continue;
	const newValue =
		value.join("=").startsWith('"') && value.join("=").endsWith('"')
			? value.join("=").slice(1, -1)
			: value.join("=");
	Deno.env.set(key, newValue);
}

export const supabase = createClient(
	Deno.env.get("PROJECT_URL")!,
	Deno.env.get("SERVICE_ROLE_KEY")!,
);

const prefixCache: Record<string, { values: string[]; lastUpdate: number }> =
	{};

export const getPrefixes = async (guild: string) => {
	const cacheValue = prefixCache[guild];
	const lastUpdateInterval = Date.now() - (cacheValue?.lastUpdate ?? 0);

	if (cacheValue != undefined && lastUpdateInterval < 30 * 60 * 1000) {
		return cacheValue.values;
	}

	const { data } = await supabase.from("servers").select("prefix").eq(
		"server_id",
		guild,
	);

	if (data == null || data.length < 1) {
		let { data: newData } = await supabase.from("servers").insert({
			server_id: guild,
		}).select("prefix");

		if (newData == null || newData.length < 1) {
			newData = [{ prefix: ["!"] }];
		}

		prefixCache[guild] = {
			values: data![0].prefix,
			lastUpdate: Date.now(),
		};

		return ["!"];
	}

	prefixCache[guild] = {
		values: data[0].prefix,
		lastUpdate: Date.now(),
	};

	return data[0].prefix;
};

export const setPrefixes = async (guild: string, prefixes: string[]) => {
	await supabase
		.from("servers")
		.update({
			prefix: prefixes,
		})
		.eq("server_id", guild);
	prefixCache[guild] = {
		values: prefixes,
		lastUpdate: Date.now(),
	};
};

export const addPrefix = async (guild: string, prefix: string) => {
	const prefixes = await getPrefixes(guild);
	if (prefixes.includes(prefix)) return;
	prefixes.push(prefix);
	await setPrefixes(guild, prefixes);
};

export const removePrefix = async (guild: string, prefix: string) => {
	const prefixes = await getPrefixes(guild);
	if (!prefixes.includes(prefix)) return;
	prefixes.splice(prefixes.indexOf(prefix), 1);
	await setPrefixes(guild, prefixes);
};

type ServersTable = {
	id: number;
	invited_at: string;
	prefix: string[];
	server_id: number;
};

supabase
	.channel("servers")
	.on<ServersTable>(
		"postgres_changes",
		{
			event: "*",
			schema: "public",
			table: "music_notifications",
		},
		(
			payload,
		) => {
			if (["UPDATE", "INSERT"].includes(payload.eventType)) {
				prefixCache[(payload.new as ServersTable).server_id] = {
					values: (payload.new as ServersTable).prefix,
					lastUpdate: Date.now(),
				};
			} else {
				delete prefixCache[(payload.old as ServersTable).server_id];
			}
		},
	)
	.subscribe();

export const purgeCache = () => {
	for (const [key, value] of Object.entries(prefixCache)) {
		const lastUpdateInterval = Date.now() - value.lastUpdate;
		if (lastUpdateInterval > 60 * 60 * 1000) {
			delete prefixCache[key];
		}
	}
};

setInterval(purgeCache, 30 * 60 * 1000);

export const resetCache = () => {
	for (const key in prefixCache) {
		delete prefixCache[key];
	}
};
