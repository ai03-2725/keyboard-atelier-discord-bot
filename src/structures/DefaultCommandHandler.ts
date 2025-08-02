import { MessageFlags, type CacheType, type Interaction } from "discord.js";
import type { GenericModuleCommandMap } from "./GenericCommandModule";
import { interactionReplySafely } from "../util/InteractionReplySafely";
import { logError } from "../core/Log";

export async function DefaultCommandHandler(interaction: Interaction<CacheType>, commandsMap: GenericModuleCommandMap) {
  
  // Commands handling
  if (interaction.isChatInputCommand()) {

    // Search for given command
    const currentCommand = commandsMap.get(interaction.commandName);
    // If the command isn't included in the supplied commands map, return
    if (!currentCommand) {
      return;
    }
    // Otherwise, handle by calling its execute function
    try {
      const [, commandPayload] = currentCommand
      await commandPayload(interaction);
    } catch (error) {
      logError(`Failed to handle command ${currentCommand}:`)
      logError(error);
      await interactionReplySafely(interaction, 'There was an error while processing this request.');
    }
  }
}