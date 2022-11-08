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

const prefixCache: Record<string, { value: string; lastUpdate: number }> = {};

export const getPrefix = async (guild: string) => {
	if (prefixCache[guild]) return prefixCache[guild].value;
	const { data } = (await supabase
		.from("data")
		.select("prefix")
		.eq("server_id", guild)) as { data: { prefix: string }[] | undefined };

	if (data == null || data.length < 1) {
		await supabase.from("data").insert({
			server_id: guild,
		});

		return "!";
	}

	prefixCache[guild] = {
		value: data[0].prefix,
		lastUpdate: Date.now(),
	};
	return data![0].prefix;
};

export const setPrefix = async (guild: string, prefix: string) => {
	await supabase
		.from("data")
		.update({
			prefix,
		})
		.eq("server_id", guild);
	prefixCache[guild] = {
		value: prefix,
		lastUpdate: Date.now(),
	};
};

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
