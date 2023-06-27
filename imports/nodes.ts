import { ClusterNodeOptions } from "./lavadeno.ts";

// Env loader because sorse
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

const nodesCount = parseInt(Deno.env.get("LAVALINK_NODES")!);

if (isNaN(nodesCount)) {
	throw new Error("Invalid node count");
}

export const nodes: ClusterNodeOptions[] = new Array(nodesCount).map((
	_,
	i,
) => ({
	host: Deno.env.get(`LAVALINK_${i}_HOST`)!,
	id: Deno.env.get(`LAVALINK_${i}_NAME`)!,
	password: Deno.env.get(`LAVALINK_${i}_PASSWORD`)!,
	port: parseInt(Deno.env.get(`LAVALINK_${i}_PORT`)!),
	resuming: {
		key: `Bidome-${Date.now()}`,
	},
	reconnect: {
		type: "exponential",
		// One minute for reconnect
		maxDelay: 60 * 1000,
		initialDelay: 1000,
		tries: -1,
	},
	secure: Deno.env.get(`LAVALINK_${i}_SECURE`) == "true",
}));
