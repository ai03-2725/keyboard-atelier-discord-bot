import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, Events, ChannelType } from "discord.js";
import { Module, type ModuleParams } from "../../structures/BaseModules";
import { GenericCommandModule } from "../../structures/GenericCommandModule";
import { interactionReplySafely } from "../../util/InteractionReplySafely";
import { logDebug, logError, logInfo } from "../../core/Log";
import { dbManagerInstance, envVarManagerInstance } from "../..";
import { warnConditionally } from "./WarnConditionally";
import { DatabaseType } from "../../core/BotDatabase";


const SCAN_CHANNEL_TYPES: ChannelType[] = [ChannelType.GuildCategory, ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildText, ChannelType.PublicThread]

export class MentionWarn extends Module {

  mentionAllowedRoleIds: string[]; 
  freelyPingableRoleIds: string[];
  db: DatabaseType;

  constructor(params: ModuleParams) {
    super(params);

    // Cache the env var values for easier lookup
    this.mentionAllowedRoleIds = envVarManagerInstance.getMentioningAllowedRoleIds();
    this.freelyPingableRoleIds = envVarManagerInstance.getFreelyPingableRoleIds();

    // Create db table if not exists
    this.db = dbManagerInstance.getDatabase();
    this.db.exec(`CREATE TABLE IF NOT EXISTS ping_warned(
        user_id INTEGER PRIMARY KEY
      )`
    )

    // Add mention handler
    this.client.on(Events.MessageCreate, async (message) => {
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

      // If user already has been warned, pass
      const statementLookup = this.db.prepare(`SELECT * FROM ping_warned WHERE user_id = ?`);
      const userWarnedAlready = statementLookup.get(message.author.id)
      if (userWarnedAlready) {
        logDebug("User is in the already-warned list")
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

      let warnSuccess = false

      // If resulting pinged members list has members, warn
      if (pingList.length > 0) {
        warnSuccess = await warnConditionally(pingList, message)
      }

      // If warning message went through, add user ID to db
      if (warnSuccess) {
        try {
          const statementInsert = this.db.prepare('INSERT INTO ping_warned (user_id) VALUES (?)');
          statementInsert.run(message.author.id)
          logDebug("Added user to already-warned list")
        } catch (error) {
          logError(error)
        }
      }

    })
  }

}