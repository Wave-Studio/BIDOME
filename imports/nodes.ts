import { ClusterNodeOptions } from "./lavadeno.ts";

const envfile = (await Deno.readTextFile(".env")).split("\n");

for (const line of envfile) {
	const [key, ...value] = line.split("=");
	const newValue = value.join("=").startsWith("\"") && value.join("=").endsWith("\"") ? value.join("=").slice(1, -1) : value.join("=");
	Deno.env.set(key, newValue);
}

export const nodes: ClusterNodeOptions[] = [{
	// Me when env isn't loading correctly
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