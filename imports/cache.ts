try {
	await Deno.mkdir("./.cache");
} catch {
	// ignore
}

try {
	await Deno.readTextFile("./.cache/data.json");
} catch {
	await Deno.writeTextFile(
		"./.cache/data.json",
		JSON.stringify({ dataVersion: 1, data: {} })
	);
}

interface Cache {
	dataVersion: number;
	data: { [key: string]: string };
}

const data: Cache = JSON.parse(await Deno.readTextFile("./.cache/data.json"));

export const getUserProfilePicture = async (url: string) => {
	const [_, id, hash] = (url.includes("?") ? url.substring(0, url.lastIndexOf("?")) : url).substring("https://cdn.discordapp.com/".length).split("/");
	if (data.data[id] === hash) {
		return await Deno.readFile(`./.cache/${id}/${hash}`);
	} else {
		if (data.data[id] !== undefined) {
			await Deno.remove(`./.cache/${id}/${data.data[id]}`);
		}
		const image = await (await fetch(url)).arrayBuffer();
		await Deno.mkdir(`./.cache/${id}`, { recursive: true });
		await Deno.writeFile(`./.cache/${id}/${hash}`, new Uint8Array(image));
		data.data[id] = hash;
		await Deno.writeTextFile("./.cache/data.json", JSON.stringify(data));
		return new Uint8Array(image);
	}
};
