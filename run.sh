# IMPORTANT
# When running in production it is suggested to add a --no-check before index.ts
# This prevents deno from type checking the files in a production enviroment

deno run --import-map=imports.json --config=deno.jsonc --allow-net --allow-env --allow-read --allow-write index.ts