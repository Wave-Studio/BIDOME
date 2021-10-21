// TODO: Write proper database

class JsonDB {
	private data: {
		[key: string]: unknown;
	};
	constructor() {
		try {
			Deno.lstatSync("./database.json");
		  } catch (err) {
			if (err instanceof Deno.errors.NotFound) {
				Deno.writeTextFileSync("./database.json", "{}");
			}
		  }
		this.data = JSON.parse(Deno.readTextFileSync("./database.json"));

		  // Auto save database every 5 minutes

		setInterval(() => {
			this.saveDatabase();
		}, 5 * 60 * 1000);
	}

	private saveDatabase() {
		Deno.writeTextFileSync("./database.json", JSON.stringify(this.data, null, "\t"))
	}

	set(key: string, value: string) {
		let object = this.data;
		const parts = key.split(".");
		const dbKey = parts[parts.length - 1];
		for (const part of parts.reverse().slice(1).reverse()) {
			if (object == undefined){
				object = {};
			}
			if (object[part] == undefined){
				object[part] = {};
			}
			// @ts-ignore - TS doesn't know that object[part] is a JSON object
			object = object[part];
		}
		object[dbKey] = value;
		this.saveDatabase()
	}

	get(key: string) {
		let object = this.data;
		const parts = key.split(".");
		const dbKey = parts[parts.length - 1];
		for (const part of parts.reverse().slice(1).reverse()) {
			if (object == undefined){
				object = {};
			}
			if (object[part] == undefined){
				object[part] = {};
			}
			// @ts-ignore - TS doesn't know that object[part] is a JSON object
			object = object[part];
		}
		return object[dbKey];
	}
}

export const Database = new JsonDB();