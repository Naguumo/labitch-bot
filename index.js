import { Client, Intents } from 'discord.js'
import { inlineCode, userMention } from '@discordjs/builders'
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioPlayerStatus,
} from '@discordjs/voice'
import ytdl from 'ytdl-core-discord'
import { createRequire } from 'module'

// eslint-disable-next-line no-unused-vars
import { CommandInteraction } from 'discord.js'

const require = createRequire(import.meta.url)
const config = require('./config.json')

/**
 * Holds playlist
 */
const songQueue = []
const audioPlayer = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
})

const playResource = () => {
  if (songQueue.length) {
    const currentSongInfo = songQueue.pop()
    const stream = ytdl.downloadFromInfo(currentSongInfo, {
      quality: 'highestaudio',
      filter: 'audioonly',
    })

    audioPlayer.play(createAudioResource(stream))
  }
}

audioPlayer.on(AudioPlayerStatus.Idle, () => {
  playResource()
})

audioPlayer.on(AudioPlayerStatus.Playing, () => {})

audioPlayer.on('error', (error) => {
  console.error(
    `Error: ${error.message} with track ${error.resource.metadata.title}`
  )
})

const myIntents = new Intents()
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES)
const client = new Client({ intents: myIntents })

client.once('ready', () => {
  console.log('Bot Ready...')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction
  if (commandName === 'play') {
    await playInteraction(interaction)
  } else if (commandName === 'skip') {
    await skipInteraction(interaction)
  }
})

client.login(config.token)

client.once('reconnecting', () => {
  console.log('Bot reconnecting...')
})

client.once('disconnect', () => {
  console.log('Bot disconnected...')
})

/**
 * Add requested song to queue, join channel of requester if not already in it
 * @param {CommandInteraction} interaction
 */
const playInteraction = async (interaction) => {
  const songInput = interaction.options.getString('song')

  const memberVoiceChannel = interaction.member.voice.channel
  if (!memberVoiceChannel) {
    await interaction.reply(
      `You need to be in a voice channel to listen to music`
    )
    return
  }

  // ---
  // Fetch information and add to queue
  // ---
  if (!ytdl.validateURL(songInput)) {
    await interaction.reply(`Invalid URL: ${songInput}`)
    return
  }

  songQueue.push(await ytdl.getInfo(songInput))
  await interaction.reply(
    `Adding ${inlineCode(songInput)} to the queue (Requested by ${userMention(
      interaction.user.id
    )})`
  )

  // ---
  // Connect to voice
  // ---
  const voiceConnection = joinVoiceChannel({
    channelId: memberVoiceChannel.id,
    guildId: memberVoiceChannel.guild.id,
    adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator,
    selfDeaf: false,
  })

  if (audioPlayer.state.status !== AudioPlayerStatus.Playing) {
    playResource()
  }

  // ---
  // Subscribe to Audio Player
  // ---
  voiceConnection.subscribe(audioPlayer)
}

/**
 * Skip to next song
 * @param {CommandInteraction} interaction
 */
const skipInteraction = async () => {}

/**
 * Clear queue
 * @param {CommandInteraction} interaction
 */
const stopInteraction = async () => {}