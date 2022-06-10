import { ClusterNodeOptions } from "./lavadeno.ts";

// Based off https://lavalink.darrennathanael.com/NoSSL/lavalink-without-ssl/
export const nodes: ClusterNodeOptions[] = [{
	host: "lavalink.oops.wtf",
	port: 2000,
	password: "www.freelavalink.ga",
	id: "FreeNode",
	reconnect: {
		type: "basic",
		tries: -1,
		delay: 5 * 1000,
	},
}];
