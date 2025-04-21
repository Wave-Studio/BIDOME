/**
 * Allows you to create a try/catch block in a single line within the same scope
 * @param fn - The function to be executed
 * @returns The result wrapped in an object containing success, data, and error properties
 */
export const tryCatch = async <T>(
	fn: () => Promise<T>
): Promise<
	| { success: true; data: T; error: undefined }
	| { success: false; data: undefined; error: Error }
> => {
	try {
		return { data: await fn(), success: true, error: undefined };
	} catch (e) {
		return { data: undefined, success: false, error: e as Error };
	}
};
