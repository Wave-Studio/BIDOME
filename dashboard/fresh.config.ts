import { defineConfig } from "$fresh/server.ts";
import unocssPlugin from "./plugins/unocss.ts";
import unocssConfig from "./uno.config.ts";

export default defineConfig({
	plugins: [
		unocssPlugin({
			ssr: true,
			// Eventually enable once fresh adds support for static folders in _fresh - Bloxs
			aot: false,
			config: unocssConfig,
		}),
		// TODO: Add UnoCSS plugin (Lukas's favorite plugin :trollface:) - Bloxs
	],
});
