import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Question might be vague or unclear**`
const BODY = 
`*This warning is issued when the first message is*
- *lengthy without line breaks (500+ chars with fewer than 3 line breaks), or*
- *very long (1000+ chars).*

Please make sure that your question is well-organized and well-formatted to make reading and understanding of its extensive contents straightforward.`

export const getMessageLongContainer = () => {
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