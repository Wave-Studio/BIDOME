import { ClusterNodeOptions } from "./lavadeno.ts";

const nodesCount = parseInt(Deno.env.get("LAVALINK_NODES")!);

if (isNaN(nodesCount)) {
	throw new Error("Invalid node count");
}

export const nodes: ClusterNodeOptions[] = new Array(nodesCount).fill(undefined)
	.map((
		_,
		i,
	) => ({
		host: Deno.env.get(`LAVALINK_${i + 1}_HOST`)!,
		id: Deno.env.get(`LAVALINK_${i + 1}_NAME`)!,
		password: Deno.env.get(`LAVALINK_${i + 1}_PASSWORD`)!,
		port: parseInt(Deno.env.get(`LAVALINK_${i + 1}_PORT`)!),
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
		secure: Deno.env.get(`LAVALINK_${i + 1}_SECURE`) == "true",
	}));
