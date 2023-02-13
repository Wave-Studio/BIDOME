import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6";

export * from "https://esm.sh/@supabase/supabase-js@1.35.6";

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
	Deno.env.get("SERVICE_ROLE_KEY")!
);

const prefixCache: Record<string, { values: string[]; lastUpdate: number }> = {};

export const getPrefixes = async (guild: string) => {
	const cacheValue = prefixCache[guild];
	const lastUpdateInterval = Date.now() - (cacheValue?.lastUpdate ?? 0);

	if (cacheValue != undefined && lastUpdateInterval < 30 * 60 * 1000) {
		return cacheValue.values;
	}

	const { data } = (await supabase.from("servers").select("prefix").eq("server_id", guild)) as { data: { prefix: string[] }[] | undefined };

	if (data == null || data.length < 1) {
		await supabase.from("servers").insert({
			server_id: guild,
		});

		prefixCache[guild] = {
			values: ["!"],
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
}

export const addPrefix = async (guild: string, prefix: string) => {
	const prefixes = await getPrefixes(guild);
	if (prefixes.includes(prefix)) return;
	prefixes.push(prefix);
	await setPrefixes(guild, prefixes);
}

export const removePrefix = async (guild: string, prefix: string) => {
	const prefixes = await getPrefixes(guild);
	if (!prefixes.includes(prefix)) return;
	prefixes.splice(prefixes.indexOf(prefix), 1);
	await setPrefixes(guild, prefixes);
}

supabase.from("servers").on("*",  (payload) => {
	if (["UPDATE", "INSERT"].includes(payload.eventType)) {
		prefixCache[payload.new.server_id] = {
			values: payload.new.prefix,
			lastUpdate: Date.now(),
		};
	} else {
		delete prefixCache[payload.old.server_id];
	}
}).subscribe();

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