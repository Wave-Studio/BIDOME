import { initializeEco } from 'eco';

export class JsonDB {
	private data: {
		[key: string]: unknown;
	} = {};
	constructor(private path = './database/core.json', autoSave = true) {
		return;
		const dirCheck = path.startsWith('./')
			? path.substring(2)
			: path.startsWith('/')
			? path.substring(1)
			: path;

		const directories = dirCheck.split('/').reverse().slice(1).reverse();

		if (directories.length > 0) {
			let currentPath = '.';
			for (const directory of directories) {
				currentPath += `/${directory}`;
				try {
					Deno.lstatSync(currentPath);
				} catch {
					Deno.mkdirSync(currentPath);
				}
			}
		}

		try {
			Deno.lstatSync(path);
		} catch (err) {
			if (err instanceof Deno.errors.NotFound) {
				Deno.writeTextFileSync(path, '{}');
			}
		}
		this.data = JSON.parse(Deno.readTextFileSync(path));

		// Auto save database every 5 minutes
		if (autoSave) {
		setInterval(() => {
			this.saveDatabase();
		}, 5 * 60 * 1000);
	}
	}

	private saveDatabase() {
		return;
		Deno.writeTextFileSync(this.path, JSON.stringify(this.data, null, '\t'));
	}

	set(key: string, value: unknown) {
		let object = this.data;
		const parts = key.split('.');
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
		this.saveDatabase();
	}

	get(key: string) {
		let object = this.data;
		const parts = key.split('.');
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
		return object[dbKey];
	}

	reload() {
		return;
		this.data = JSON.parse(Deno.readTextFileSync(this.path));
	}
}

export const Database = new JsonDB();
export const GlobalEco = new JsonDB('./database/eco/global.json');
export const ServerEco = new JsonDB('./database/eco/server.json');

export const initDatabases = () => {
	initializeEco();
};
