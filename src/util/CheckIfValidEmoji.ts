import type { Guild } from "discord.js"

// Tests whether the input string is a valid Discord emoji
// Discord emoji seem to be one of three types:
// Custom: When sent in through text, it appears as "<:emoteName:snowflake>"
// Custom animated: Same as above, but with a lowercase a before the first colon: "<a:emoteName:snowflake>"
//   - According to Discord's docs, emoji names are min 2 chars long, only contains alphanumeric characters and underscores
//   - Based on own testing, seems to be [0-9a-zA-Z], between 2 and 32 chars 
//   - Snowflakes are continuously growing, so for now just make sure it's a number
// Stock: Registers as an unicode char - seems to match with a "\p{Extended_Pictographic}" regex
//   - Based on further testing, stuff like :regional_indicator_[a-z]: require the "\p{Emoji_Presentation}" check
//   - Based on further testing, the above two don't match simpler emoji such as :one:; opt for \p{Emoji} instead

// Can pass an optional guild parameter to check if the emoji actually exists in the guild

// Returns 1 if built-in unicode emoji
// Returns 2 if custom emoji
// Returns 0 if invalid or if the emoji doesn't exist in the supplied guild
export const checkIfValidEmoji = async (input: string, guild: Guild | undefined = undefined) => {
  // First check custom emoji
  if (/^<a?:[0-9a-zA-Z]{2,32}:[0-9]+>$/.test(input)) {
    if (guild) {
      const emojiId = input.replace(">", "").split(":").slice(-1)[0]! // Guaranteed to exist if passes the custom emoji structure regex
      try {
        const guildEmojis = await guild.emojis.fetch(emojiId)
        // Exists if emoji fetch succeeds
        return true
      } catch (error) {
        // Doesn't exist if emoji fetch fails
        return false
      }
    } else {
      // If not checking against existence in a guild, just return true if structure passes
      return true
    }
  } 
  // Then check unicode match
  else if (/^\p{Emoji}$/u.test(input)) {
    return true
  } 
  // If both fail, not an emoji
  else {
    return false
  }
}

