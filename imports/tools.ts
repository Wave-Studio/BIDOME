export const formatMs = (ms: number): string => {
	let seconds = Math.floor(ms / 1000);
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	let days = Math.floor(hours / 24);
	hours -= days * 24;
	const weeks = Math.floor(days / 7);
	days -= weeks * 7;
	return [
		`${weeks > 0 ? ` ${weeks} Week${weeks > 1 ? 's' : ''}` : ''}`,
		`${days > 0 ? ` ${days} Day${days > 1 ? 's' : ''}` : ''}`,
		`${hours > 0 ? ` ${hours} Hour${hours > 1 ? 's' : ''}` : ''}`,
		`${minutes > 0 ? ` ${minutes} Minute${minutes > 1 ? 's' : ''}` : ''}`,
		`${seconds > 0 ? ` ${seconds} Second${seconds > 1 ? 's' : ''}` : ''}`,
	]
		.join('')
		.substring(1);
};

export const format = (name: string): string => {
	return `${name.substring(0, 1).toUpperCase()}${name
		.substring(1)
		.toLowerCase()}`;
};

export const removeDiscordFormatting = (text: string): string => {
	return text
		.replace(/\_/, '\\_')
		.replace(/\*/, '\\*')
		.replace(/\`/, '\\`')
		.replace(/\~/, '\\~');
};
