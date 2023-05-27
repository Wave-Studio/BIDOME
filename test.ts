const instance = new Worker(new URL("./index.ts", import.meta.url), {
	type: "module",
});

instance.onmessage = (e) => {
	console.log(e.data);
}