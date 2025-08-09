import { ContainerBuilder } from "discord.js"

const HEADER =
`### **Question might be vague or unclear**`
const BODY = 
`*This warning is issued when the first message is very short (<100 chars).*

Please make sure that you are providing sufficient context with your question.
Anyone without any knowledge of what you are doing should be able to follow along and know exactly what you are asking for.`

export const getMessageShortContainer = () => {
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