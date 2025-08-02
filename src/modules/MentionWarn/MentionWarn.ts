import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, Events, ChannelType } from "discord.js";
import { Module, type ModuleParams } from "../../structures/BaseModules";
import { GenericCommandModule } from "../../structures/GenericCommandModule";
import { interactionReplySafely } from "../../util/InteractionReplySafely";
import { logDebug, logInfo } from "../../core/Log";
import { envVarManagerInstance } from "../..";
import { warnConditionally } from "./WarnConditionally";


const SCAN_CHANNEL_TYPES: ChannelType[] = [ChannelType.GuildCategory, ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildText, ChannelType.PublicThread]

export class MentionWarn extends Module {

  mentionAllowedRoleIds: string[]; 

  constructor(params: ModuleParams) {
    super(params);

    // Cache the env var values for easier lookup
    this.mentionAllowedRoleIds = envVarManagerInstance.getMentionAllowedRoleIds();

    // Add mention handler
    this.client.on(Events.MessageCreate, (message) => {
      logDebug(message)

      // Don't reply to bots (incl oneself)
      if (message.author.bot) {
        logDebug("Sender is a bot - pass")
        return;
      }

      // Don't respond if the message wasn't sent in a channel type required
      if (!SCAN_CHANNEL_TYPES.includes(message.channel.type)) {
        logDebug("Channel type not included - pass")
        return;
      }

      // Fetch member within the guild to check their perms
      const memberInGuild = message.guild.members.resolve(message.author.id)
      // Fetch channel within the guild
      const channelInGuild = message.guild.channels.resolve(message.channel.id)

      // Don't warn if user is an administrator
      if (!envVarManagerInstance.getLogDebug() && memberInGuild.permissionsIn(channelInGuild).has(PermissionFlagsBits.Administrator)) {
        logDebug("Member has admin perms - pass")
        return;
      }

      // Don't warn user if they have a role that exempts warnings
      if (memberInGuild.roles.cache.some(role => this.mentionAllowedRoleIds.includes(role.id))) {
        logDebug("User has bypass role - pass")
        return;
      }

      const pingList = [...message.mentions.members.keys()].filter(item => item !== message.author.id)

      logDebug(`Replied user:`)
      logDebug(message.mentions.repliedUser)
      logDebug("Ping list:")
      logDebug(pingList)

      if (pingList.length > 0) {
       
        warnConditionally(pingList, message)

      }

    })
  }

}