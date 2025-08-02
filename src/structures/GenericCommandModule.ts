import { Events, type ChatInputCommandInteraction, type SharedSlashCommand } from "discord.js";
import { CommandModule, Module, type ModuleParams } from "./BaseModules";
import { DefaultCommandHandler } from "./DefaultCommandHandler";

export type ChatInputPayloadFunction = (interaction: ChatInputCommandInteraction) => Promise<void>;
export type GenericModuleCommandMap = Map<string, [SharedSlashCommand, ChatInputPayloadFunction]> 

// A generic module which registers and handles basic slash commands
// Maintains a map of "command name": [SharedSlashCommand, payload function]
// Add commands to this map in the constructor of modules which extend this

// As long as all commands are added to the map, all of them are returned by getCommands()
// In addition, all commands are automatically handled by DefaultCommandHandler

export abstract class GenericCommandModule extends CommandModule {

  commands: Map<string, [SharedSlashCommand, ChatInputPayloadFunction]> = new Map();

  override getCommands = () => {
    // Filter out just the SharedSlashCommands out of the commands map
    return Array.from(this.commands, ([, [command,]]) => command)
  }

  constructor(params: ModuleParams) {
    super(params)

    // Handle commands
    this.client.on(Events.InteractionCreate, async interaction => {
      DefaultCommandHandler(interaction, this.commands);
    })
  }

}