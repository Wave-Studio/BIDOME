import { Embed, Webhook } from "./imports/harmony.ts";
import { formatMs, sleep } from "./imports/tools.ts";

let lastLaunch = 0;
let tooFastCrashes = 0;

const createInstance = async () => {
	for (const gitcmd of ["git reset --hard origin/dev"]) {
		const git = Deno.run({
			cmd: gitcmd.split(" "),
		});

		await git.status();
	}

	lastLaunch = Date.now();

	return Deno.run({
		cmd: "./deno run --import-map=imports.json --config=deno.jsonc --allow-net --allow-env --allow-read --allow-write --allow-run --no-check index.ts --no-lava".split(
			" "
		),
	});
};

let webhook: Webhook | undefined = undefined;
if (Deno.env.get("WEBHOOK_URL") != undefined) {
	webhook = await Webhook.fromURL(Deno.env.get("WEBHOOK_URL") as string);
}

while (true) {
	console.log("Launching instance...");
	const launchTime = Date.now();
	const instance = await createInstance();
	console.log("Instance created");
	await instance.status();
	await instance.close();
	console.log("Instance crashed!");
	const crashTime = Date.now();
	const liveTime = crashTime - launchTime;

	if (Date.now() - lastLaunch < 1000 * 30) {
		tooFastCrashes++;
		if (tooFastCrashes > 5) {
			console.log("Too many crashes have occured in a row, rebooting the container in 5 seconds");
			await sleep(1000 * 5);
			Deno.exit(1);
		} else {
			console.log(
				"Instance crashed too fast! Waiting 10 seconds before reboot"
			);
			await sleep(1000 * 10);
			continue;
		}
	} else {
		tooFastCrashes = 0;
	}

	if (webhook != undefined) {
		webhook.send({
			embeds: [
				new Embed({
					author: {
						name: "Bidome Dev Crash Handler",
						icon_url:
							"https://cdn.discordapp.com/avatars/778670182956531773/75fdc201ce942f628a61f9022db406dc.png?size=1024",
					},
					title: "Bidome dev has crashed!",
					description:
						`Rebooting the bot, time bot was alive: ${formatMs(liveTime)}`,
				}).setColor("random"),
			],
			avatar:
				"https://cdn.discordapp.com/avatars/778670182956531773/75fdc201ce942f628a61f9022db406dc.png?size=1024",
			name: "Bidome Crash Handler",
		});
	}
}
