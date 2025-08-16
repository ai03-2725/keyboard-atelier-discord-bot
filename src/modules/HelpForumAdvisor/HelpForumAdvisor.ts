import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, Events, ChannelType, ContainerBuilder, MessageFlags, TextDisplayBuilder, Message, Collection } from "discord.js";
import { Module, type ModuleParams } from "../../structures/BaseModules";
import { GenericCommandModule } from "../../structures/GenericCommandModule";
import { interactionReplySafely } from "../../util/InteractionReplySafely";
import { logDebug, logError, logInfo } from "../../core/Log";
import { dbManagerInstance, envVarManagerInstance } from "../..";
import { DatabaseType } from "../../core/BotDatabase";
import { getMessageShortContainer } from "./const/MessageShort";
import { getMessageLongContainer } from "./const/MessageLong";
import { getPossiblyNotAQuestionContainer } from "./const/MessageNotAQuestion";
import { getPossibleReviewRequestContainer } from "./const/MessageReviewRequest";
import { sleep } from "../../util/Sleep";
import { getQuestionVagueContainer } from "./const/MessageVague";
import { getCommercialContainer } from "./const/MessageCommercial";

enum WarningTypes {
  "FIRST_MESSAGE_LENGTH_SHORT",
  "FIRST_MESSAGE_LENGTH_LONG",
  "MISSING_QUESTION_MARK",
  "POSSIBLY_REVIEW_THREAD",
  "QUESTION_VAGUE",
  "COMMERCIAL_REQUEST"
}


export class HelpForumAdvisor extends Module {

  // Help channel IDs
  // TODO: Convert to env vars
  helpChannelIds: string[];

  constructor(params: ModuleParams) {
    super(params);

    this.helpChannelIds = envVarManagerInstance.getHelpForumIds()


    // Add thread handler
    this.client.on(Events.ThreadCreate, async (thread, newlyCreated) => {

      logDebug("Received new thread")
      //logDebug(thread)

      if (!newlyCreated) {
        logDebug("Not newly created")
        return;
      }

      // Check if it is a forum thread 
      if (!(thread.type === ChannelType.PublicThread && thread.parent.type === ChannelType.GuildForum)) {
        logDebug("Not a public thread in a forum channel")
        return;
      }

      // Check if the thread was posted into a channel this module should manage
      if (!(this.helpChannelIds.includes(thread.parent.id))) {
        logDebug("Not in a channel this module should manage")
        return;
      }

      // Make sure that the sender is not the bot itself
      if (thread.ownerId === this.client.user.id) {
        logDebug("Not replying to self")
        return;
      }

      // Checks passed - start scanning its contents
      logDebug("Handling thread")

      // Wait for the first message to be posted
      // Can take some time after thread creation due to slow file uploads
      const MAX_THREAD_TIMEOUT = 120 * 1000;
      const THREAD_CHECK_DELAY = 2 * 1000;
      let currentWaitTime = 0;
      let messagesInThread: Collection<string, Message<true>>;
      
      while (true) {
        await sleep(THREAD_CHECK_DELAY);
        currentWaitTime += THREAD_CHECK_DELAY;
        messagesInThread = await thread.messages.fetch();
        // Once thread contents exist (first message exists), proceed to checks
        if (messagesInThread.first()) {
          break;
        } 
        // Otherwise if thread is empty after 2 minutes of timeout, cancel
        else if (currentWaitTime > MAX_THREAD_TIMEOUT) {
          logDebug("Skipping handling - reached timeout")
          return;
        }
      }

      // Get text contents of first message
      const firstMessageContents = messagesInThread.first().content;

      logDebug(firstMessageContents)

      // Build an array of warnings
      let warnings: WarningTypes[] = []

      // Check length of first message
      logDebug(`Length of first message: ${firstMessageContents.length}`)
      if (firstMessageContents.length < 100) {
        warnings.push(WarningTypes.FIRST_MESSAGE_LENGTH_SHORT)
      }
      else if (firstMessageContents.length >= 1000) {
        warnings.push(WarningTypes.FIRST_MESSAGE_LENGTH_LONG)
      } 
      // If it's over 500 chars, check for newline count
      else if (firstMessageContents.length > 500) {
        const firstMessageNewlineCount = (firstMessageContents.match(/\n/g) || []).length
        logDebug(`Number of newlines in first message: ${firstMessageNewlineCount}`)
        if (firstMessageNewlineCount < 3) {
          warnings.push(WarningTypes.FIRST_MESSAGE_LENGTH_LONG)
        }
      }


      // Check thread title for ending question mark
      if (!(/\?$/.test(thread.name))) {
        warnings.push(WarningTypes.MISSING_QUESTION_MARK)
      }

      // Check both title and first message for occurrences of the words "feedback" or "review"
      if (/(feedback|review)/i.test(thread.name + firstMessageContents)) {
        warnings.push(WarningTypes.POSSIBLY_REVIEW_THREAD)
      }

      // Catch commercial requests/do-work-for-me requests
      if (/design (an? .*)?(one )?(for )?me/i.test(thread.name + firstMessageContents)) {
        warnings.push(WarningTypes.COMMERCIAL_REQUEST)
      }

      // Check title for commonly problematic/vague question structures
      // - "can/could someone/anyone-"
      if (/(can|could) (some|any)one/i.test(thread.name)) {
        warnings.push(WarningTypes.QUESTION_VAGUE)
        warnings.push(WarningTypes.POSSIBLY_REVIEW_THREAD)
      }

      // - "can/could I get/receive"
      if (/(can|could) I (get|receive)/i.test(thread.name)) {
        warnings.push(WarningTypes.QUESTION_VAGUE)
        warnings.push(WarningTypes.POSSIBLY_REVIEW_THREAD)
      }

      // - "I need"
      if (/i need/i.test(thread.name)) {
        warnings.push(WarningTypes.QUESTION_VAGUE)
      }
      

      // If any warnings exist, build the warning reply
      if (warnings.length === 0) {
        return;
      }

      let replyItems = []
      replyItems.push(new TextDisplayBuilder({content: `<@${thread.ownerId}>`}))

      const replyHeader = new ContainerBuilder()
        .addTextDisplayComponents(
          textDisplay => textDisplay
            .setContent(`-# Atelier Helper Bot - ${warnings.length} warnings`)
        )
        .addSeparatorComponents(
          separator => separator,
        )
        .addTextDisplayComponents(
          textDisplay => textDisplay
            .setContent("### **Hey!**"),
          textDisplay => textDisplay
            .setContent("I'm an automated bot trying to maximize your chances of getting an answer to your question."),
          textDisplay => textDisplay
            .setContent("I've noticed some things that might be problematic - please check them out below.")
        )
      replyItems.push(replyHeader)

      if (warnings.includes(WarningTypes.MISSING_QUESTION_MARK)) {
        replyItems.push(getPossiblyNotAQuestionContainer())
      }

      if (warnings.includes(WarningTypes.QUESTION_VAGUE)) {
        replyItems.push(getQuestionVagueContainer())
      }
      
      if (warnings.includes(WarningTypes.POSSIBLY_REVIEW_THREAD)) {
        replyItems.push(getPossibleReviewRequestContainer())
      }

      if (warnings.includes(WarningTypes.FIRST_MESSAGE_LENGTH_SHORT)) {
        replyItems.push(getMessageShortContainer())
      }

      if (warnings.includes(WarningTypes.FIRST_MESSAGE_LENGTH_LONG)) {
        replyItems.push(getMessageLongContainer())
      }

      if (warnings.includes(WarningTypes.COMMERCIAL_REQUEST)) {
        replyItems.push(getCommercialContainer())
      }

      const replyFooter = new ContainerBuilder()
        .addTextDisplayComponents(
          textDisplay => textDisplay
            .setContent("Please note that I'm just a simple bot responding on very simple triggers."),
          textDisplay => textDisplay
            .setContent("If the above recommendations are inapplicable, please disregard."),
          textDisplay => textDisplay
            .setContent("Thanks!"),
        )
      replyItems.push(replyFooter)

      try {
        // Reply
        await thread.send({ components: replyItems, flags: MessageFlags.IsComponentsV2 });
        logDebug("Replied to mention message.")
        return true;
      } catch (error) {
        logError("Failed to reply to message:");
        logError(error);
        return false;
      }

    })
  }

}