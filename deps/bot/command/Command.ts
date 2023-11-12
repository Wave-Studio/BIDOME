export class Command {
	// General
	public name = "";
	public description?: string;
	public aliases: string[] = [];

	// Discord specific
	public slashOnly = false;
	public textOnly = false;

	// Perm specific
	public ownerOnly = false;
	/** Required perms to run command */
	public userPerms = [];
	/** Required perms to run command */
	public botPerms = [];

	// Platform specific
	public discordOnly = false;
	public guildedOnly = false;

	/** Return false to cancel command execution */
	public async beforeExecute(): Promise<void | false> {}

	public async execute(): Promise<void> {}

	public async afterExecute(): Promise<void> {}
}
