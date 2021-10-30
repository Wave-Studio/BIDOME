# IMPORTANT
# When running in production it is suggested to add a --no-check before index.ts
# This prevents deno from type checking the files in a production enviroment

# Launch Lavalink with the bot
deno run --import-map=imports.json --allow-net --allow-env --allow-read --allow-write --allow-run index.ts

# Don't launch lavalink
# deno run --import-map=imports.json --allow-net --allow-env --allow-read --allow-write --allow-run index.ts --no-lava