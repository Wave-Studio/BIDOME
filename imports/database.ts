// TODO: Write proper database

class JsonDB {
	private data: {
		[key: string]: string;
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
		this.data[key] = value;
		this.saveDatabase()
	}

	get(key: string) {
		return this.data[key];
	}
}

export const Database = new JsonDB();