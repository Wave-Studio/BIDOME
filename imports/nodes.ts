import { ClusterNodeOptions } from "./lavadeno.ts";

const envfile = (await Deno.readTextFile(".env")).split("\n");

export const nodes: ClusterNodeOptions[] = [{
	// Me when env isn't loading correctly
	host: envfile.filter((l) => l.startsWith("LAVALINK_HOST"))[0].substring("LAVALINK_HOST=".length),
	port: parseInt(envfile.filter((l) => l.startsWith("LAVALINK_PORT"))[0].substring("LAVALINK_PORT=".length)),
	password: envfile.filter((l) => l.startsWith("LAVALINK_PASSWORD"))[0].substring("LAVALINK_PASSWORD=".length),
	id: "1",
	reconnect: {
		type: "basic",
		tries: -1,
		delay: 5 * 1000,
	},
}];
