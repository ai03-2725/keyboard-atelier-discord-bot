import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Question might be vague or incomplete**`

const BODY = 
`*This warning is issued when the thread title is a variant of "could someone help/check...".*

When posting a question, please make sure it is not vague and is clearly specific without needing to open the thread.

*Acceptable examples:*
- "What do I look for when choosing diodes for a keyboard matrix?"
- "Did I make the correct choice when choosing countersunk screws for my weight?"

*Unacceptable examples:*
- "Could someone help me with diodes?"
- "Can someone check my decision?"`


export const getMessageQuestionVagueContainer = () => {
  const reply = new ContainerBuilder()
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(HEADER)
    )
    .addSeparatorComponents(
      separator => separator
    )
    .addTextDisplayComponents(
      textDisplay => textDisplay
        .setContent(BODY)
    )
  return reply
}