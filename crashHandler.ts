const createInstance = () => {
	return Deno.run({
		"cmd": ["deno run --import-map=imports.json --allow-net --allow-env --allow-read --allow-write --allow-run --no-check index.ts --no-lava"]
	})
}

while(true) {
	const instance = createInstance()
	await instance.status();
	await instance.close();
}