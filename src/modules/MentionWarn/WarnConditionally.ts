import { ChatInputCommandInteraction, ContainerBuilder, GuildMember, Message, MessageFlags, TextDisplayBuilder, type Interaction, type InteractionReplyOptions } from "discord.js"
import { logDebug, logError } from "../../core/Log";


// Warn user on ping
export const warnConditionally = async (pingedIds: string[], message: Message<boolean>) => {

  let warningString: string | null = "";

  // Check if the message pings others in a reply
  const replyPingEnabled = message.mentions.repliedUser && pingedIds.includes(message.mentions.repliedUser.id)

  // Build the warning string
  if (replyPingEnabled) {
    warningString = `It appears that you have pinged another member by leaving the mention setting (the \`@ON\` toggle) enabled when replying.\n`
    if (pingedIds.length > 1) {
      warningString += `In addition, you have pinged others directly by username.\n`
    }
    warningString += `\n`
  } else if (message.mentions.members) {
    warningString = `It appears that you have pinged another member in your message.\n\n`
  }

  // Finish the string off
  warningString += `Please **refrain from pinging others** (either via at-mentioning or replies with \`@ON\`) **without justifiable reason** - it is considered poor etiquette.\n\n`
  warningString += `For more details, please read the [community rules](<https://discord.com/channels/728571839529353216/728573336384307202/728575634233884702>) and [designer guidelines](<https://discord.com/channels/728571839529353216/1325034203833831444/1325034275233337397>).`
  

  // Build the reply components
  const mentionUser = new TextDisplayBuilder()
    .setContent(message.author.toString())

  const replyContainer = new ContainerBuilder()
    .setAccentColor(0xeb4034)
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(`**Hey!**\n\n` + warningString)
    )
    .addSeparatorComponents(
      separator => separator,
    )
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(`-# If you sent the mention with justifiable reason and awareness of the above, please disregard this warning.\n-# Further warnings can be disabled by obtaining the \`@Ping-Warning-Bypass\` role.`)
    )

  try {
    // Reply
    await message.reply({ components: [replyContainer], flags: MessageFlags.IsComponentsV2, });
    logDebug("Replied to mention message.")
    return true;
  } catch (error) {
    logError("Failed to reply to message:");
    logError(error);
    return false;
  }
}
