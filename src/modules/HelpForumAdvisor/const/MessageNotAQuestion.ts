import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Thread title might not be a question**`

const BODY =
`*This warning is issued when the thread title does not end with a question mark.*

As per the posting guidelines of this forum, all thread titles should be a question.
Please make sure that it is possible to understand what is being inquired about without needing to open the thread.

*Acceptable examples:*
- "Which component should I use to drive 5V addressable LEDs from 3.3V logic?"
- "How do I create this triangular feature in Autodesk Fusion?"

*Unacceptable examples:*
- "Question regarding keyboard dimensions"
- "DRC error"`

export const getPossiblyNotAQuestionContainer = () => {
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