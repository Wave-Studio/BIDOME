# Bidome

## What is Bidome?

Bidome is a multipurpose Discord bot trying to offer something for everyone. You
can view a command list Here (soon:tm:)

## Selfhosting

### Disclaimer

While you can selfhost Bidome it is suggested that you use the
[public instance](https://discord.com/api/oauth2/authorize?client_id=778670182956531773&permissions=8&scope=applications.commands%20bot)
so you don't need to go through the configuration process. If you do want to
selfhost then follow the guide below:

### Requirements

- [Java](https://adoptium.net/marketplace/)
  - [Lavalink](https://github.com/lavalink-devs/Lavalink)
- [Deno](https://deno.land/)
- [Discord](https://discord.com/developers/applications/) bot account
- [Supabase](https://supabase.com/dashboard/projects) project

### Steps

1. Copy the `.env.example` file over to `.env`
1. Set up a lavalink node and place the credentials into `.env`
1. Set the Supabase URL and secret_role values into `.env`
1. Create the tables present in `assets/db/database.types.ts` (Info on how to do
   that soon:tm:)
1. Enable the `presence`, `message content`, and `server members` intent on the
   Discord Dashboard
1. Run the bot
