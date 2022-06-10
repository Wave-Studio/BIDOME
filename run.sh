# IMPORTANT
# When running in production it is suggested to add a --no-check before index.ts
# This prevents deno from type checking the files in a production enviroment

# To disable lavalink being summoned add --no-lava at the end of command

deno run --import-map=imports.json --config=deno.jsonc --allow-net --allow-env --allow-read --allow-write --allow-run index.ts