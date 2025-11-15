import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, Events, ChannelType, ContainerBuilder, MessageFlags, TextDisplayBuilder, Message, Collection } from "discord.js";
import { Module, type ModuleParams } from "../../structures/BaseModules";
import { GenericCommandModule } from "../../structures/GenericCommandModule";
import { interactionReplySafely } from "../../util/InteractionReplySafely";
import { logDebug, logError, logInfo } from "../../core/Log";
import { dbManagerInstance, envVarManagerInstance } from "../..";
import { DatabaseType } from "../../core/BotDatabase";
import { sleep } from "../../util/Sleep";
import { getInvalidTitleContainer } from "./const/MessageInvalidTitle";
import { getCommercialContainer } from "./const/MessageCommercial";
import { getPossiblyQuestionContainer } from "./const/MessagePossiblyQuestion";
enum WarningTypes {
  "COMMERCIAL_REQUEST",
  "POSSIBLY_QUESTION",
  "INVALID_TITLE"
}


export class ProjectsForumAdvisor extends Module {

  // Help channel IDs
  // TODO: Convert to env vars
  projectChannelIds: string[];

  constructor(params: ModuleParams) {
    super(params);

    this.projectChannelIds = envVarManagerInstance.getProjectForumIds()


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
      if (!(this.projectChannelIds.includes(thread.parent.id))) {
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

      // General checks:

      // Catch commercial requests/do-work-for-me requests
      if (/design (an? .*)?(one )?(for )?me /i.test(thread.name + firstMessageContents)) {
        warnings.push(WarningTypes.COMMERCIAL_REQUEST)
      }


      // Check title for phrases that are likely not a project name:

      // Includes question mark
      if (/\?/.test(thread.name)) {
        warnings.push(WarningTypes.POSSIBLY_QUESTION)
        warnings.push(WarningTypes.INVALID_TITLE)
      }

      // - "can/could someone/anyone-"
      if (/(can|could) (some|any)one/i.test(thread.name)) {
        warnings.push(WarningTypes.POSSIBLY_QUESTION)
        warnings.push(WarningTypes.INVALID_TITLE)
      }

      // - "can/could I get/receive"
      if (/(can|could) I (get|receive)/i.test(thread.name)) {
        warnings.push(WarningTypes.POSSIBLY_QUESTION)
        warnings.push(WarningTypes.INVALID_TITLE)
      }

      // - "I need"
      if (/i need/i.test(thread.name)) {
        warnings.push(WarningTypes.POSSIBLY_QUESTION)
        warnings.push(WarningTypes.INVALID_TITLE)
      }

      // Title includes with "Question"
      if (/(I have a )?Question /i.test(thread.name)) {
        warnings.push(WarningTypes.POSSIBLY_QUESTION)
        warnings.push(WarningTypes.INVALID_TITLE)
      }

      // Includes term "review"
      // Pass on scanning for "feedback" for now - could be used validly such as "haptic feedback"
      if (/(review)/i.test(thread.name)) {
        warnings.push(WarningTypes.INVALID_TITLE)
      }

      // Includes term "feedback" without a common non-review prefix such as "haptic feedback"
      if (/(?<!(Tactile |Haptic |Visual |Auditory ))Feedback/i.test(thread.name)) {
        warnings.push(WarningTypes.INVALID_TITLE)
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
            .setContent("I'm an automated bot that checks on project forum posts."),
          textDisplay => textDisplay
            .setContent("I've noticed some things that might be problematic - please check them out below.")
        )
      replyItems.push(replyHeader)

            if (warnings.includes(WarningTypes.INVALID_TITLE)) {
        replyItems.push(getInvalidTitleContainer())
      }

      if (warnings.includes(WarningTypes.POSSIBLY_QUESTION)) {
        replyItems.push(getPossiblyQuestionContainer())
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