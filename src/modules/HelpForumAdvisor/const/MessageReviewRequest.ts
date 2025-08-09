import { ContainerBuilder } from "discord.js"

const HEADER = 
`### **Thread might be a "review-this-entire-project" request**`

const BODY = 
`*This warning is issued when the thread title or first message includes the term "feedback" or "review".*

As per the posting guidelines of this forum, threads along the lines of "review this entire project for me" are not allowed in the help forums.
Please create a thread for your project in the project forums instead and request a review there.

If your question included the terms "feedback" or "review" in an unrelated context, please disregard.`


export const getPossibleReviewRequestContainer = () => {
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