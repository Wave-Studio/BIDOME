# Bidome Bot

## What is Bidome?

Bidome is a multipurpose Discord bot that features fun commands and music.

## Selfhosting

### Getting Started

It is suggested to use the publicly avalible Bidome Bot located
[here](https://discord.com/api/oauth2/authorize?client_id=778670182956531773&permissions=8&scope=applications.commands%20bot)
but if you want to host your own version continue reading.

### Requirements

    - Java (Java 11 required, 16 suggested)
    - Deno
    - A Discord bot
    - A supabase project

### Selfhosting

    1. Create a file called `.env` with the contents of `.env.example`
    2. Set up lavalink:
        * If you already have a lavalink node:
            - Place your Lavalink credentials in .env
        * If you don't have a lavalink node:
            - Download Lavalink from Github: https://github.com/freyacodes/Lavalink
            - Set the credentials in .env to what is in `application.yml`
    3. Set the Supabase URL and secret_role values in the .env
    4. Enable the `presence`, `message content`, and `server members` intent on the discord dashboard
    5. Run the bot
