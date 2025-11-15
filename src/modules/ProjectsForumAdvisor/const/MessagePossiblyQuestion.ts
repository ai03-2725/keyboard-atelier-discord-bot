import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Post might be a question or request**`

const BODY =
`*This warning is issued when the following occurs:*
- Title includes a question mark.
- Title includes request phrases such as "Can somebody" or "Can I receive".
- Title includes the term "Question".  
  
As per the posting guidelines of this forum, this forum is for project threads - all thread titles should be only your project name or a very brief description of the project if it does not have one yet.  
See existing threads for examples.  

Question posts belong in the respective question forums - please check the posting guidelines prior to posting to them as well.`

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