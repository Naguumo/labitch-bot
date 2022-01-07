import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const config = require('./config.json')

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song given a URL or search term')
    .addStringOption((stringOption) =>
      stringOption
        .setName('song')
        .setRequired(true)
        .setDescription('The URL or name of song')
    ),
].map((cmd) => cmd.toJSON())

const rest = new REST({ version: '9' }).setToken(config.token)

rest
  .put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commands,
  })
  .then(() => {
    console.log('Registered app commands!')
  })
  .catch((reason) => {
    console.log('Failed to register commands')
    console.error(reason)
  })
