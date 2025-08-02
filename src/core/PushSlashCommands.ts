import { REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody, type SharedSlashCommand } from "discord.js";
import { updateBotDataJson, type BotDataJson } from "./BotData";
import hash from 'object-hash';
import { logDebug, logError, logInfo, LogLevel } from "./Log";
import { envVarManagerInstance } from "..";


export const pushSlashCommandsIfNecessary = async (allCommands: SharedSlashCommand[], botData: BotDataJson) => {
  const commandsHash = hash(allCommands, {unorderedArrays: true});
  if (botData.lastSuccessfulCommandsHash === commandsHash) { 
    logDebug("Commands hash identical to what is recorded - skipping re-upload")
    return
  } else {
    // Changes detected, register all known commands via REST API
    logInfo("Commands list has changed since last boot - pushing latest data via REST API.")
    let registerCommandsList: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    allCommands.forEach(command => {
      registerCommandsList.push(command.toJSON());
    })
    const rest = new REST().setToken(envVarManagerInstance.getAppToken());
    (async () => {
      try {
        logDebug(`Pushing ${registerCommandsList.length} application commands.`);
        const data = await rest.put(
          Routes.applicationCommands(envVarManagerInstance.getApplicationId()),
          { body: registerCommandsList },
        );

        logInfo(`Successfully registered application commands.`);
        logDebug(`Returned data:`)
        logDebug(data);
        // Update known good hash
        botData.lastSuccessfulCommandsHash = commandsHash;
        updateBotDataJson(botData);
      } catch (error) {
        logError("Failed to push application commands.");
        logError(error);
        process.exit(1);
      }
    })();
  }
}