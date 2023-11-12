import { AppProps } from "$fresh/server.ts";
import { asset } from "$fresh/runtime.ts";

const css = asset("uno.css");

export default function App({ Component }: AppProps) {
	return (
		<html>
			<head>
				<meta charset="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<title>Dashdome</title>
			</head>
			<body>
				<Component />
			</body>
		</html>
	);
}
