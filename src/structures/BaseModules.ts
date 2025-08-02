import { Client, SharedSlashCommand } from "discord.js";

export interface ModuleParams {
  client: Client,
}

// Bare minimum module
export abstract class Module {

  // The client object that gets passed in during init
  client: Client;

  // Constructor
  constructor(params: ModuleParams) {
    this.client = params.client;
  }

}

// A module which registers any commands
export abstract class CommandModule extends Module {

  // All Modules must provide a function which returns a list of SharedSlashCommand objects provided by the module
  // These are collected by index.js and submitted to Discord via REST API
  abstract getCommands: () => SharedSlashCommand[];

}
