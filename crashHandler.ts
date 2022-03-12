import { Webhook, Embed } from "./imports/harmony.ts";

const createInstance = () => {
	return Deno.run({
		cmd: "deno run --import-map=imports.json --allow-net --allow-env --allow-read --allow-write --allow-run --no-check index.ts --no-lava".split(
			" "
		),
	});
};

let webhook: Webhook | undefined = undefined;
if (Deno.env.get("WEBHOOK_URL") != undefined) {
	webhook = await Webhook.fromURL(Deno.env.get("WEBHOOK_URL") as string);
	webhook.name = "Bidome Crash Handler";
	webhook.avatar =
		"https://cdn.discordapp.com/avatars/778670182956531773/75fdc201ce942f628a61f9022db406dc.png?size=1024";
}

while (true) {
	const instance = createInstance();
	await instance.status();
	await instance.close();
	if (webhook != undefined) {
		webhook.send({
			embeds: [
				new Embed({
					author: {
						name: "Bidome Crash Handler",
						icon_url:
							"https://cdn.discordapp.com/avatars/778670182956531773/75fdc201ce942f628a61f9022db406dc.png?size=1024",
					},
					title: "Bidome offline!",
					description:
						"The deno process has been killed. Starting a new one...",
				}).setColor("random"),
			],
		});
	}
}
