import { ClusterNodeOptions } from "./lavadeno.ts";

export const nodes: ClusterNodeOptions[] = [{
	host: Deno.env.get("LAVALINK_HOST")!,
	port: parseInt(Deno.env.get("LAVALINK_PORT")!),
	password: Deno.env.get("LAVALINK_PASSWORD")!,
	id: "1",
	reconnect: {
		type: "basic",
		tries: -1,
		delay: 5 * 1000,
	},
}];
