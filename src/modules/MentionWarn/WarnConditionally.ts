import { ChatInputCommandInteraction, ContainerBuilder, GuildMember, Message, MessageFlags, TextDisplayBuilder, type Interaction, type InteractionReplyOptions } from "discord.js"
import { logDebug, logError } from "../../core/Log";


// Warn user on ping
export const warnConditionally = async (pingedIds: string[], message: Message<boolean>) => {

  let warningString: string | null = "";

  // Check if the message pings others in a reply
  const replyPingEnabled = message.mentions.repliedUser && pingedIds.includes(message.mentions.repliedUser.id)

  // Build the warning string
  if (replyPingEnabled) {
    warningString = `Just in case - when replying to others with mentions enabled (with the \`@ON\` toggle)`
    if (pingedIds.length > 1) {
      warningString += ` or mentioning others with a ping`
    
    }
  } else {
    warningString = `Just in case - when mentioning others with a ping`
  }
  warningString += `, please make sure that you are using it considerately with justifiable reason.`
  warningString += `\n`

  const replyContainer = new ContainerBuilder()
    .setAccentColor(0x808080)
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(warningString)
    )
    .addSeparatorComponents(
      separator => separator,
    )
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(`-# For more details, see the [designer guidelines](<https://discord.com/channels/728571839529353216/1325034203833831444/1325034541198475284>).\n-# Disable this message by [obtaining](<https://discord.com/channels/728571839529353216/728589828597219369/728590122110419066>) the \`@Ping-Warning-Bypass\` role.`)
    )

  try {
    // Reply
    await message.reply({ components: [replyContainer], flags: MessageFlags.IsComponentsV2 });
    logDebug("Replied to mention message.")
    return true;
  } catch (error) {
    logError("Failed to reply to message:");
    logError(error);
    return false;
  }
}
