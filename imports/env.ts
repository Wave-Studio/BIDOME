import { config } from "dotenv";

const env = config();

export const token = env.token ?? Deno.env.get("token");
export const replitdb = env.replitdb ?? Deno.env.get("replitdb");