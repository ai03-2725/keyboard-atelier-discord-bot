import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Thread title might be breaking forum guidelines**`

const BODY = 
`*This warning is issued when the following occurs:*
- Title resembles a question or request.  
- Title includes terms such as "feedback" or "review".  
  
As per the posting guidelines of this forum, all thread titles should be only your project name or a very brief description of the project if it does not have one yet.  
Please do not shove more content into the thread title.  

*Acceptable examples:*
- "Polaris"
- "Split keyboard with trackball"

*Unacceptable examples:*
- "Question regarding keyboard dimensions"
- "DRC error"`


export const getInvalidTitleContainer = () => {
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