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
  freelyPingableRoleIds: string[];

  constructor(params: ModuleParams) {
    super(params);

    // Cache the env var values for easier lookup
    this.mentionAllowedRoleIds = envVarManagerInstance.getMentioningAllowedRoleIds();
    this.freelyPingableRoleIds = envVarManagerInstance.getFreelyPingableRoleIds();

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

      // Create a list of users that were pinged by the message
      const pingList = [...message.mentions.members.keys()].filter(targetMemberId => {
        // Exclude pinging self
        if (targetMemberId === message.author.id) {
          return false;
        }
        // Exclude members who have freely pingable roles assigned
        const targetMemberInGuild = message.guild.members.resolve(targetMemberId)
        if (targetMemberInGuild.roles.cache.some(role => this.freelyPingableRoleIds.includes(role.id))) {
          return false;
        }
        return true;
      })

      logDebug(`Replied user:`)
      logDebug(message.mentions.repliedUser)
      logDebug("Ping list:")
      logDebug(pingList)

      // If resulting pinged members list has members, warn
      if (pingList.length > 0) {
        warnConditionally(pingList, message)
      }

    })
  }

}