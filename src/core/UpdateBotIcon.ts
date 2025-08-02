import {
  readFileSync,
  existsSync,
} from 'fs';
import { updateBotDataJson, type BotDataJson } from './BotData';
import hash from 'object-hash';
import type { Client } from 'discord.js';
import { logDebug, logError, logInfo, LogLevel } from './Log';

export const updateBotIconIfNecessary = async (client: Client<true>, botData: BotDataJson) => {

  let botIcon: NonSharedBuffer;

  // If a custom bot icon is provided, prioritize that
  if (existsSync("./data/custom-bot-icon.png")) {
    logDebug("Found custom bot icon.")
    botIcon = readFileSync("./data/custom-bot-icon.png");
  } else {
    logDebug("Using stock bot icon.")
    botIcon = readFileSync("./assets/default-bot-icon.png")
  }
  
  // Check if the icon has been modified since last boot; upload if necessary
  const botIconHash = hash(botIcon)
  logDebug(`Bot icon hash is "${botIconHash}".`)
  if (botData.lastKnownBotIconHash !== botIconHash) {
    logInfo("Bot icon has been modified - uploading new version.");
    try {
      await client.user.setAvatar(botIcon)
      logInfo("Bot icon updated.")
      botData.lastKnownBotIconHash = botIconHash;
      updateBotDataJson(botData);
    } catch (error) {
      logError("Could not update bot's icon:")
      logError(error)
    }
  }

}