interface RecursiveThing {
	[key: string]: RecursiveThing | unknown;
}

export class JsonDB {
	private data: RecursiveThing = {};

	public constructor(private path = "./database/data.json", autoSave = true) {
		if (autoSave) {
			setInterval(() => {
				this.save();
			}, 5 * 60 * 1000);
		}
	}

	public async initDatabase() {
		try {
			await Deno.mkdir(this.path.substring(0, this.path.lastIndexOf("/")), {
				recursive: true,
			});
		} catch {
			// Ignore
		}

		try {
			await Deno.readTextFile(this.path);
		} catch {
			await Deno.writeTextFile(this.path, JSON.stringify({ dbversion: "1.0" }));
		}

		const fileData = await Deno.readTextFile(this.path);
		this.data = JSON.parse(fileData);
	}

	public async save() {
		// Prevent database from being corrupted if an error occurs (Either the backup or the original file would become corrupt but not both)
		await Deno.writeTextFile(
			`${this.path.replace(".json", ".backup.json")}`,
			await Deno.readTextFile(this.path)
		);
		await Deno.writeTextFile(this.path, JSON.stringify(this.data));
		await Deno.writeTextFile(
			`${this.path.replace(".json", ".backup.json")}`,
			JSON.stringify(this.data)
		);
	}

	public set(key: string, value: unknown) {
		let object = this.data;
		const parts = key.split(".");
		const dbKey = parts[parts.length - 1];
		for (const part of parts.reverse().slice(1).reverse()) {
			if (object == undefined) {
				object = {};
			}
			if (object[part] == undefined) {
				object[part] = {};
			}
			// @ts-ignore - TS doesn't know that object[part] is a JSON object
			object = object[part];
		}
		object[dbKey] = value;
		this.save();
	}

	public get<T>(key: string): T {
		let object = this.data;
		const parts = key.split(".");
		const dbKey = parts[parts.length - 1];
		for (const part of parts.reverse().slice(1).reverse()) {
			if (object == undefined) {
				object = {};
			}
			if (object[part] == undefined) {
				object[part] = {};
			}
			// @ts-ignore - TS doesn't know that object[part] is a JSON object
			object = object[part];
		}
		return object[dbKey] as T;
	}


	public async reload() {
		this.data = JSON.parse(await Deno.readTextFile(this.path));
	}
}

export const Database = new JsonDB();
