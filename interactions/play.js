// eslint-disable-next-line no-unused-vars
import { CommandInteraction, CacheType } from 'discord.js'

/**
 *
 * @param {CommandInteraction<CacheType>} interaction
 */
export const playInteraction = async (interaction) => {
  console.log('interaction', interaction)
  const songInput = interaction.options.getString('song')
  await interaction.reply(`Sabo wants to hear ${songInput}.`)
}
