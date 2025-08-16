import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Question might be a commercial request**`

const BODY = 
`*This warning is issued when the thread title or first post contains "design ... for me" or similar.*

Commercial requests, work requests, and "design on my behalf" requests are strictly prohibited in Atelier beyond the restricted commercial category.`


export const getCommercialContainer = () => {
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