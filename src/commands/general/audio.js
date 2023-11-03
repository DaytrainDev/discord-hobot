import { ApplicationCommandType, ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { joinVoiceChannel, createAudioResource, createAudioPlayer } from '@discordjs/voice';

export default class AudioCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'audio',
      description: 'Play audio in the current voice channel.',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'play',
          description: 'Upload an audio file to play',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.Attachment,
              name: 'file',
              description: 'Audio file',
              required: true,
            },
          ],
        },
        {
          name: 'pause',
          description: 'Pause audio playback',
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: 'unpause',
          description: 'Resume audio playback',
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: 'stop',
          description: 'Stop audio playback.',
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    });

    this.audioPlayer = createAudioPlayer();
  }

  async execute({ interaction }) {
  // const prompt = interaction.options.getString('prompt');
    if (interaction.channel.type === ChannelType.GuildVoice || interaction.channel.type === ChannelType.GuildStageVoice) {
      const subcommand = interaction.options.getSubcommand();

      // subcommands
      if (subcommand === 'play') {
        await this.play({ interaction });
      }

      if (subcommand === 'pause') {
        await this.pause({ interaction });
      }

      if (subcommand === 'unpause') {
        await this.unpause({ interaction });
      }

      if (subcommand === 'stop') {
        await this.stop({ interaction });
      }

      return;
    }

    interaction.reply({
      content: 'This command requires a voice channel.',
      ephemeral: true,
    });
  }

  async play({ interaction }) {
    await interaction.deferReply({ ephemeral: true });
    const file = interaction.options.getAttachment('file');
    const connection = joinVoiceChannel({
      channelId: interaction.channel.id,
      guildId: interaction.channel.guild.id,
      adapterCreator: interaction.channel.guild.voiceAdapterCreator,
    });

    const musicData = createAudioResource(file?.url);
    this.subscription = connection.subscribe(this.audioPlayer);
    this.audioPlayer.play(musicData);

    // TODO - embed play, pause, stop, skip, etc. buttons
    await interaction.followUp({
      content: `Playback started for file \`${file?.name}\``,
    });
  }

  async pause({ interaction }) {
    await interaction.deferReply({ ephemeral: true });
    this.audioPlayer.pause();

    await interaction.followUp({
      content: 'Playback paused',
    });
  }

  async unpause({ interaction }) {
    await interaction.deferReply({ ephemeral: true });
    this.audioPlayer.unpause();

    await interaction.followUp({
      content: 'Playback paused',
    });
  }

  async stop({ interaction }) {
    await interaction.deferReply({ ephemeral: true });
    this.audioPlayer.stop();
    this.subscription?.connection.destroy();

    await interaction.followUp({
      content: 'Playback stopped',
    });
  }
}
