import { 
  Client,
  Events,
  GatewayIntentBits,
  SharedSlashCommand,
} from "discord.js";

import type { CommandModule, Module } from "./structures/BaseModules";
import { PingHandler } from "./modules/PingHandler/PingHandler";
import { createBotDataDirIfNecessary, loadBotDataJson } from "./core/BotData";
import { pushSlashCommandsIfNecessary } from "./core/PushSlashCommands";
import { updateBotIconIfNecessary } from "./core/UpdateBotIcon";
import { logDebug, logError, logInfo, LogLevel, logWarn } from "./core/Log";
import { EnvVarManager } from "./core/EnvVarManager";
import { MentionWarn } from "./modules/MentionWarn/MentionWarn";
import { BotDatabaseManager } from "./core/BotDatabase";
import { HelpForumAdvisor } from "./modules/HelpForumAdvisor/HelpForumAdvisor";
//import { AdministrationModule } from "./modules/Administration/Administration";


// Load environment variables
const envVarManagerInstance = new EnvVarManager()
export { envVarManagerInstance }

// Begin boot
logInfo(`Starting bot instance.`);

// Make sure that the data directory exists
createBotDataDirIfNecessary()

// Load bot config data
let botData = loadBotDataJson();

// Load bot database
const dbManagerInstance = new BotDatabaseManager();
export {dbManagerInstance}

// Create a new client instance
logDebug("Creating client")
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});


// Create an instance of all bot modules

// Command modules - modules based on CommandModule which provide slash command(s)
logDebug("Loading modules with commands")
const commandModules: CommandModule[] = []
commandModules.push(new PingHandler({client: client}));

// Non-command modules - these will not be queried for their commands
logDebug("Loading modules without commands")
const nonCommandModules: Module[] = []
// nonCommandModules.push(new MentionWarn({client: client}))
nonCommandModules.push(new HelpForumAdvisor({client: client}))


// Create a global commands list based on the commands list of each module
logDebug("Querying all modules for commands")
let allCommands: SharedSlashCommand[] = [];
for (const module of commandModules) {
  allCommands = allCommands.concat(module.getCommands())
}

// If any changes have occurred to the slash commands since last boot, push changes via REST API
await pushSlashCommandsIfNecessary(allCommands, botData)

// Run once after the bot is operational
client.once(Events.ClientReady, async readyClient => {
	logInfo(`Initialization completed. Logged in as ${readyClient.user.tag}.`);

  // Update avatar if it has changed since last boot
  updateBotIconIfNecessary(readyClient, botData)
});

// Log in to Discord
try {
  client.login(envVarManagerInstance.getAppToken());
} catch (error) {
  logError("Bot could not log into Discord.");
  logError("Please verify that you have completed the Discord application setup and that all credentials are valid.");
  process.exit(1);
}

// Handle exits gracefully
const shutdown = (cause: "SIGTERM" | "SIGINT" | "uncaughtException") => {
  logInfo(`Shutting down due to reason: ${cause}`)
  dbManagerInstance.closeDatabase()
  process.exit(cause === "uncaughtException" ? 1 : 0);
}
process
  .on('SIGTERM', () => shutdown('SIGTERM'))
  .on('SIGINT', () => shutdown('SIGINT'))
  // .on('uncaughtException', (e) => {
  //   logError(e);
  //   shutdown('uncaughtException')
  // });
