import { Webview } from "../../../deps/desktop/webview.ts";
import Routes from "../../dist/routes.ts";

export const getRoute = <T extends keyof typeof Routes>(path: T, ...args: string[]): typeof Routes[T] => {
	const route = Routes[path];

	if (!route) {
		throw new Error(`Route ${path} does not exist`);
	}

	if (args.length == 0) {
		return route;
	}

	const filledRoute = route.replace(/{{.*}}/g, (file) => {
		const strippedKey = file.substring(2, file.length - 2);

		if (strippedKey.startsWith("\\") || !strippedKey.startsWith("$")) {
			return file;
		}

		const index = parseInt(strippedKey.substring(1));

		if (index >= args.length) {
			return file;
		}

		return args[index];
	});

	return filledRoute;
}

export const renderRoute = <T extends keyof typeof Routes>(webview: Webview, path: T, ...args: string[]): void => {
	webview.navigate(`data:text/html,${encodeURIComponent(getRoute(path, ...args))}`);
}