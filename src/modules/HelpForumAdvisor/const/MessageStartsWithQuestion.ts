import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Question starts with "question"**`

const BODY = 
`*This warning is issued when the thread title starts with "Question" or "I have a question".*

You are already using the help forums to ask a question - there is no need to state that you are asking a question. 
Please make sure that the inquiry is clear without needing to open the thread.

*Acceptable examples:*
- "What do I look for when choosing diodes for a keyboard matrix?"
- "Did I make the correct choice when choosing countersunk screws for my weight?"

*Unacceptable examples:*
- "Question regarding matrix diodes"
- "I have a question regarding screws"`


export const getQuestionInThreadTitleContainer = () => {
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