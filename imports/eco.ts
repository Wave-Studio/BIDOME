import { Database } from "database";

export interface EcoUserDBObject {
    userid: string;
    balance: number;
    lastDailyClaim?: number;
    job?: {
        id: number;
        lastJobTime?: number;
    };
    inventory: EcoInventoryDBObject[],
    level: number;
}

export interface EcoInventoryDBObject {
    itemid: string;
    amount: number;
}

export const getProfileFromDatabase = (userid: string) => {
    return createOrFetchProfile(userid);
}

export const createOrFetchProfile = (userid: string) => {
    let userProfile: EcoUserDBObject = {
        userid,
        balance: 0,
        inventory: [],
        level: 0
    };
    const profiles = Database.get("eco.profiles") as EcoUserDBObject[];
    if (profiles.filter(profile => profile.userid === userid).length === 0) {
        profiles.push(userProfile);
        Database.set("eco.profiles", profiles);
    } else {
        userProfile = profiles.filter(profile => profile.userid === userid)[0];
    }
    return userProfile;
}

export const initializeEco = () => {
    if (Database.get("eco.profiles") == undefined) {
        Database.set("eco.profiles", []);
    }
}

export const saveProfile = (profile: EcoUserDBObject) => {
    const profiles = Database.get("eco.profiles") as EcoUserDBObject[];
    const filteredProfiles = profiles.filter(p => p.userid !== profile.userid);
    filteredProfiles.push(profile);
    Database.set("eco.profiles", profiles);
}