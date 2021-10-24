import { GlobalEco, ServerEco, Database } from 'database';

export interface EcoUserDBObject {
	userid: string;
	balance: number;
	lastDailyClaim?: number;
	job?: {
		id: number;
		lastJobTime?: number;
	};
	inventory: EcoInventoryDBObject[];
	level: number;
    lastKnownUsername: string;
}

export interface EcoInventoryDBObject {
	itemid: string;
	amount: number;
}

export const getProfileFromDatabase = (guildID: string, userid: string, userTag: string) => {
	return createOrFetchProfile(guildID, userid, userTag);
};

export const createOrFetchProfile = (
	guildID: string,
	userid: string, userTag: string
): EcoUserDBObject => {
	let userProfile: EcoUserDBObject = {
		userid,
		balance: 0,
		inventory: [],
		level: 0,
        lastKnownUsername: userTag
	};

	if (isServerEco(guildID)) {
		const servers = ServerEco.get('eco.servers') as {
			[guildID: string]: EcoUserDBObject[];
		};

		if (!servers[guildID]) {
			servers[guildID] = [];
		}

		const serverProfiles = servers[guildID];
        if (serverProfiles.filter(p=>p.userid !== userid).length === 0) {
            serverProfiles.push(userProfile);
            ServerEco.set('eco.servers', servers);
        } else {
            userProfile = serverProfiles.filter(p=>p.userid === userid)[0];
        }
	} else {
		const profiles = GlobalEco.get('eco.profiles') as EcoUserDBObject[];

		if (profiles.filter((p) => p.userid === userid).length > 0) {
			userProfile = profiles.filter((p) => p.userid === userid)[0];
		} else {
			profiles.push(userProfile);
			GlobalEco.set('eco.profiles', profiles);
		}
	}

	return userProfile;
};

export const initializeEco = () => {
	if (GlobalEco.get('eco.profiles') == undefined) {
		GlobalEco.set('eco.profiles', []);
	}
	if (ServerEco.get('eco.servers') == undefined) {
		ServerEco.set('eco.servers', []);
	}
	if (Database.get('eco.notglobal') == undefined) {
		Database.set('eco.notglobal', []);
	}
};

export const saveProfile = (guildID: string, profile: EcoUserDBObject) => {
	if (isServerEco(guildID)) {
		const servers = ServerEco.get('eco.servers') as {
			[guildID: string]: EcoUserDBObject[];
		};
		const server = servers[guildID] ?? [];
		const profiles = server.filter((p) => p.userid !== profile.userid);
		profiles.push(profile);
		servers[guildID] = profiles;
		ServerEco.set('eco.servers', servers);
	} else {
		const profiles = (GlobalEco.get('eco.profiles') as EcoUserDBObject[]) ?? [];
		const filteredProfiles = profiles.filter(
			(p) => p.userid !== profile.userid
		);
		filteredProfiles.push(profile);
		GlobalEco.set('eco.profiles', filteredProfiles);
	}
};

export const getAllProfiles = (guildID: string) => {
    if (isServerEco(guildID)) {
        const servers = ServerEco.get('eco.servers') as {
            [guildID: string]: EcoUserDBObject[];
        };
        const server = servers[guildID] ?? [];
        return server;
    } else {
        return (GlobalEco.get('eco.profiles') as EcoUserDBObject[]) ?? [];
    }
}

export const isServerEco = (guildid: string): boolean => {
	const notGlobalServers = Database.get('eco.notglobal') as string[];
	return notGlobalServers.includes(guildid);
};

export const isGlobalEco = (guildid: string): boolean => {
	return !isServerEco(guildid);
};
