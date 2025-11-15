import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Post might be a commercial request**`

const BODY = 
`*This warning is issued when the thread title or first post contains "design ... for me" or similar.*

Commercial requests, work requests, and "design on my behalf" requests are prohibited in Atelier beyond the permitted scope and channels.`


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