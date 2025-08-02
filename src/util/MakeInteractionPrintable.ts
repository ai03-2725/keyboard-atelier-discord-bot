import type { Interaction } from "discord.js"

export const makeInteractionPrintable = (interaction: Interaction) => {
  return JSON.stringify(interaction, (key, value) => typeof value === "bigint" ? value.toString() : value, 2)
}