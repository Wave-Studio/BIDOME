import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.6";

export * from "https://esm.sh/@supabase/supabase-js@1.35.6";

// Yes, this is the same loader as in nodes.ts, but for some reason env isn't set when accessing here
const envfile = (await Deno.readTextFile(".env")).split("\n");

for (const line of envfile) {
	const [key, ...value] = line.split("=");
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

const prefixCache: Record<string, string> = {};

export const getPrefix = async (guild: string) => {
	if (prefixCache[guild]) return prefixCache[guild];
	const { data } = await supabase
		.from("data")
		.select("prefix")
		.eq("server_id", guild);
	
	if (data == null || data.length < 1) {
		await supabase.from("data").insert({
			server_id: guild,
		});

		return "!";
	}

	prefixCache[guild] = data![0].prefix;
	return data![0].prefix;
};

export const setPrefix = async (guild: string, prefix: string) => {
	await supabase
		.from("data")
		.update({
			prefix,
		})
		.eq("server_id", guild);
	prefixCache[guild] = prefix;
};

export const resetCache = () => {
	for (const key in prefixCache) {
		delete prefixCache[key];
	}
}
