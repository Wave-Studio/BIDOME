try {
	await Deno.mkdir("./db");
} catch {
	// Ignore
}

export const kv = await Deno.openKv("./db/bidome.sqlite");
