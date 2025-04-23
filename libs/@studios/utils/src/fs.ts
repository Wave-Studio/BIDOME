/**
 * Finds all files in said directory and any subdirectories
 *
 * @requires Deno.readDir - Not supported outside Deno without polyfill
 */
export const getAllFilesRecursively = async (
	dir: string,
	extensions?: string[],
): Promise<string[]> => {
	if (globalThis.Deno == undefined) {
		throw new Error(
			"This function relies on Deno.readDir to function, please polyfill it or use a different method",
		);
	}

	const files: string[] = [];
	extensions = extensions?.map((ext) => ext.toLowerCase()).map(
		(ext) => ext.startsWith(".") ? ext.substring(1) : ext,
	);

	for await (const file of Deno.readDir(dir)) {
		const filePath = `${dir}/${file.name}`;

		if (file.isDirectory) {
			const subFiles = await getAllFilesRecursively(filePath, extensions);
			files.push(...subFiles);
		} else {
			if (extensions != undefined) {
				const ext = filePath.split(".").pop() ?? "";
				if (!extensions.includes(ext)) {
					continue;
				}
			}
			files.push(filePath);
		}
	}

	return files;
};

/**
 * Finds all folders in said directory
 * @requires Deno.readDir - Not supported outside Deno without polyfill
 */
export const getAllRootFolders = async (dir: string): Promise<string[]> => {
	if (globalThis.Deno == undefined) {
		throw new Error(
			"This function relies on Deno.readDir to function, please polyfill it or use a different method",
		);
	}

	const folders: string[] = [];

	for await (const file of Deno.readDir(dir)) {
		if (file.isDirectory) {
			folders.push(`${dir}/${file.name}`);
		}
	}

	return folders;
};

/**
 * Converts window's \ delimiters to / and removes any trailing slashes
 * @param path the file path
 * @returns normalized path
 */
export const normalizePath = (path: string): string => {
	return path.replace(/\\/g, "/").replace(/\/+$/, "");
};
