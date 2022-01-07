import { Client, Intents } from 'discord.js'
import { createRequire } from 'module'
import { playInteraction } from './interactions/play'

const require = createRequire(import.meta.url)
const config = require('./config.json')

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.once('ready', () => {
  console.log('Bot Ready...')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction
  if (commandName === 'play') {
    await playInteraction(interaction)
  }
})

client.login(config.token)
