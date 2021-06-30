//import { Client } from 'https://deno.land/x/replit_database@v1.1/mod.ts';
import { replitdb } from "env";

class fordev{
	constructor(_replitdb: string){}
	get(_key: string){
		return ">";
	}
	set(_key: string, _value: unknown){
		return;
	}
}

export const ReplitDB = new fordev( // Replace with Client when not in dev
	replitdb
);