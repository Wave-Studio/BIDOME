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

// for (const line of envfile) {
// 	const [key, ...value] = line.split("=").filter((l) => l.trim() != "" && !l.startsWith("#"));
// 	const newValue = value.join("=").startsWith("\"") && value.join("=").endsWith("\"") ? value.join("=").slice(1, -1) : value.join("=");
// 	Deno.env.set(key, newValue);
// }
// https://lavalink.darrennathanael.com/NoSSL/lavalink-without-ssl/ my beloved
export const nodes: ClusterNodeOptions[] = [
		{
		host: Deno.env.get("LAVALINK_HOST")!,
		port: parseInt(Deno.env.get("LAVALINK_PORT")!),
		password: Deno.env.get("LAVALINK_PASSWORD")!,
		id: "1",
		reconnect: {
			type: "exponential",
			maxDelay: 15000,
			initialDelay: 1000,
			tries: -1 // unlimited
		},
		resuming: {
			key: `Bidome-${Date.now()}`
		}
	},
	{
		host: "lavalink.cyber-host.eu",
		port: 2333,
		password: "discord.gg/cyberhost",
		id: "2",
		reconnect: {
			type: "exponential",
			maxDelay: 15000,
			initialDelay: 1000,
			tries: -1, // unlimited
		},
		resuming: {
			key: `Bidome-${Date.now()}`,
		},
	},
	{
		host: "narco.buses.rocks",
		port: 2269,
		password: "glasshost1984",
		id: "3",
		reconnect: {
			type: "exponential",
			maxDelay: 15000,
			initialDelay: 1000,
			tries: -1, // unlimited
		},
		resuming: {
			key: `Bidome-${Date.now()}`,
		},
	},
];
