try {
	await Deno.mkdir("./db");
} catch {
	// Ignore if already exists - Bloxs
}

export const kv = await Deno.openKv("./db/bidome.sqlite");
