import { ContainerBuilder, Message, MessageFlags } from "discord.js"
import { logDebug, logError } from "../../core/Log";


// Warn user on ping
export const warnConditionally = async (pingedIds: string[], message: Message<boolean>) => {

  let warningString: string | null = "";

  // Check if the message pings others in a reply
  const replyPingEnabled = message.mentions.repliedUser && pingedIds.includes(message.mentions.repliedUser.id)

  // Build the warning string
  if (replyPingEnabled) {
    warningString = `Just in case since you replied to a message with mentions enabled (with the \`@ON\` toggle)`
    if (pingedIds.length > 1) {
      warningString += ` and also pinged others in your message`
    
    }
  } else {
    warningString = `Just in case since you mentioned others in your message`
  }
  warningString += ` - when pinging others, please make sure that you are only doing so **considerately** with **justifiable reason**.\n\n`
  warningString += `For more details, see the [designer guidelines](<https://discord.com/channels/728571839529353216/1325034203833831444/1325034541198475284>).`

  const replyContainer = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent("**Hey!**\n\n" + warningString)
    )
    .addSeparatorComponents(
      separator => separator,
    )
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(`-# This message is only shown once.`)
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
