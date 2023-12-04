export interface Config {
	configVersion: 3;
	rememberSettings: boolean;
}

const defaultConfig: Config = {
	configVersion: 3,
	rememberSettings: false,
}

const configRoutes = {
	darwin: `${Deno.env.get(
		"HOME"
	)!}/Library/Application Support/bidome/config.json`,
	linux: `${Deno.env.get("HOME")!}/.config/bidome/config.json`,
	windows: `${Deno.env.get("USERPROFILE")!}/bidome/config.json`,
};

let config: Config;

const writeDefaultConfig = async () => {
	const configPath = configRoutes[Deno.build.os as keyof typeof configRoutes];

	await Deno.writeTextFile(configPath, JSON.stringify(defaultConfig, undefined, 4));
}

export const getConfig = async (): Promise<Error | Config> => {
	if (config != undefined) return config;
	if (!["darwin", "linux", "windows"].includes(Deno.build.os))
		return new Error("Unsupported OS (Make an issue to add support!)");

	const configPath = configRoutes[Deno.build.os as keyof typeof configRoutes];

	try {
		await Deno.mkdir(configPath.substring(0, configPath.lastIndexOf("/")), {
			recursive: true,
		});
	} catch (error) {
		return new Error("Error while creating config folder", {
			cause: error,
		});
	}

	try {
		await Deno.stat(configPath);
	} catch {
		try {
			await writeDefaultConfig();
		} catch (error) {
			return new Error("Error while creating config file", {
				cause: error,
			});
		}
	}

	try {
		config = JSON.parse(await Deno.readTextFile(configPath));
	} catch (error) {
		return new Error("Error while reading config file", {
			cause: error,
		});
	}

	if (config.configVersion != defaultConfig.configVersion) {
		try {
			await writeDefaultConfig();
		} catch (error) {
			return new Error("Error while creating config file", {
				cause: error,
			});
		}
	}

	return config;
};
