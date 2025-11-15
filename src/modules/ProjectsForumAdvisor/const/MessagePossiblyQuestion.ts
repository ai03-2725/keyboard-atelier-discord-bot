import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Post might be a question or request**`

const BODY =
`*This warning is issued when the thread title resembles a question:*
- Title includes a question mark.
- Title includes request phrases such as "Can somebody" or "Can I receive".
- Title includes the term "Question".  
  
As per the posting guidelines of this forum, this forum is for project threads which track a project over extended time, not for one-off questions.  
Question posts belong in the PCB/case question forums.`

export const getPossiblyQuestionContainer = () => {
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