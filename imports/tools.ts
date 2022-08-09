export const formatMs = (ms: number, nontext = false): string => {
	let seconds = Math.floor(ms / 1000);
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	let days = Math.floor(hours / 24);
	hours -= days * 24;
	const weeks = Math.floor(days / 7);
	days -= weeks * 7;
	if (!nontext) {
		return [
			`${weeks > 0 ? ` ${weeks} Week${weeks > 1 ? "s" : ""}` : ""}`,
			`${days > 0 ? ` ${days} Day${days > 1 ? "s" : ""}` : ""}`,
			`${hours > 0 ? ` ${hours} Hour${hours > 1 ? "s" : ""}` : ""}`,
			`${
				minutes > 0
					? ` ${minutes} Minute${minutes > 1 ? "s" : ""}`
					: ""
			}`,
			`${
				seconds > 0
					? ` ${seconds} Second${seconds > 1 ? "s" : ""}`
					: ""
			}`,
		]
			.join("")
			.substring(1);
	} else {
		return [
			`${weeks > 0 ? `${weeks}:` : ""}`,
			`${weeks > 0 || days > 0 ? `${days}:` : ""}`,
			`${hours > 0 ? `${hours < 10 ? `0${hours}` : hours}:` : ""}`,
			`${minutes < 10 ? `0${minutes}` : minutes}:`,
			`${seconds < 10 ? `0${seconds}` : seconds}`,
		].join("");
	}
};

export const isOneGreaterThan0 = (...args: number[]): boolean => {
	for (const arg of args) {
		if (arg ?? 0 > 0) {
			return true;
		}
	}
	return false;
};

export const areAllGreaterThan0 = (...args: number[]): boolean => {
	let validNums = 0;
	for (const arg of args) {
		if (arg ?? 0 > 0) {
			validNums++;
		}
	}
	return validNums == args.length;
};

export const format = (name: string): string => {
	return `${name.substring(0, 1).toUpperCase()}${
		name
			.substring(1)
			.toLowerCase()
	}`;
};

export const removeDiscordFormatting = (text: string): string => {
	return text
		.replace(/\_/, "\\_")
		.replace(/\*/, "\\*")
		.replace(/\`/, "\\`")
		.replace(/\[/, "\\[")
		.replace(/\]/, "\\]")
		.replace(/\)/, "\\)")
		.replace(/\(/, "\\(")
		.replace(/\~/, "\\~");
};

export const removeDiscordCodeBlocks = (text: string): string => {
	return text.replace(/`/gi, "\\`");
};

export const getRandomInteger = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffleArray = (array: unknown[]) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

export enum TimeUnit {
	SECOND = 1000,
	MINUTE = 60 * 1000,
	HOUR = 60 * 60 * 1000,
	DAY = 24 * 60 * 60 * 1000,
	WEEK = 7 * 24 * 60 * 60 * 1000,
	MONTH = 30 * 24 * 60 * 60 * 1000,
	YEAR = 365 * 24 * 60 * 60 * 1000,
}

export const toMs = (str: string) => {
	let msValue = 0;
	let unitType = "";
	let unitValue = "";

	const convertToMS = () => {
		msValue += parseInt(unitValue) * ({
			s: TimeUnit.SECOND,
			m: TimeUnit.MINUTE,
			h: TimeUnit.HOUR,
			d: TimeUnit.DAY,
			w: TimeUnit.WEEK,
			mo: TimeUnit.MONTH,
			y: TimeUnit.YEAR,
		}[unitType] as number);
		unitType = "";
		unitValue = "";
	};

	for (const char of str) {
		if (!isNaN(parseInt(char))) {
			if (unitType !== "") {
				convertToMS();
			}
			if (unitType === "") {
				unitValue += char;
			}
		} else {
			unitType += char;
		}
	}

	if (unitType !== "") {
		convertToMS();
	}

	return msValue;
};

export const sleep = (length: number) => new Promise((resolve) => setTimeout(resolve, length));
