// A module with specialized behavior
// Does not provide a default command handler for tailored behavior that can be specified individually
// General expectation is that this specialized module has few or one command with many subcommands to handle a single behavior

// Add all commands to the commands array so that they are returned via getCommands

import type { SharedSlashCommand } from "discord.js"
import { CommandModule, Module } from "./BaseModules"

export abstract class SpecializedCommandModule extends CommandModule {

  commands: SharedSlashCommand[] = []

  override getCommands = () => {
    // Filter out just the SharedSlashCommands out of the commands map
    return this.commands
  }
  
}