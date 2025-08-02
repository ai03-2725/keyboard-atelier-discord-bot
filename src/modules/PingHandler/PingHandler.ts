import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType } from "discord.js";
import { type ModuleParams } from "../../structures/BaseModules";
import { GenericCommandModule } from "../../structures/GenericCommandModule";
import { interactionReplySafely } from "../../util/InteractionReplySafely";
import { logInfo } from "../../core/Log";

export class PingHandler extends GenericCommandModule {

  constructor(params: ModuleParams) {
    super(params);

    // Add module commands
    // Ping
    this.commands.set(
      // Key
      "ping", [
      // Slash command
      new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Verifies whether the bot is operating or not.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	      .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
          .setName("text")
          .setDescription("Replies with this text (and logs it to console for debug reasons).")
          .setRequired(false)
        ),
      // Payload
      async (interaction: ChatInputCommandInteraction) => {
        if (interaction.options.getString("text")) {
          logInfo("Received a ping with the following text:");
          logInfo(interaction.options.getString("text"));
          await interactionReplySafely(interaction, `Reaction bot is operating.\n\nReceived text:\n\`\`\`\n${interaction.options.getString("text")}\n\`\`\``);
        }
        await interactionReplySafely(interaction, 'Reaction bot is operating.');
      }
    ]);
  }

}