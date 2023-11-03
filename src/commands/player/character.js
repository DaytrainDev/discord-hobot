import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { DEFAULT_TOKEN } from '../../utils/gameplayHelpers.js';

export const autocompleteOptions = (options, idkey, valkey, value) => {
  const filteredOptionList = value
    ? options.filter((opt) => opt[valkey].toLowerCase().includes(value.toLowerCase()))
    : options;

  const mappedOptions = filteredOptionList
    .map((opt) => ({ name: `${opt?.[valkey]}`, value: `${opt?.[idkey]}` }));

  return mappedOptions?.slice?.(0, 24) ?? [];
};

// TODO: autostart events with node-cron and cron.schedule

export default class CharacterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'character',
      description: 'Manage your characters and other settings',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'select',
          description: 'Select an active character for this channel',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'name',
              description: 'Choose a character',
              required: true,
              autocomplete: true,
            },
          ],
        },
        {
          name: 'create',
          description: 'Create a new character',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'name',
              description: 'Your character\'s name',
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Attachment,
              name: 'token',
              description: 'Upload a token for your character',
            },
          ],
        },
        {
          name: 'edit',
          description: 'Edit an existing character',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'name',
              description: 'Character\'s Current Name',
              required: true,
              autocomplete: true,
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'new_name',
              description: 'Character\'s New Name',
            },
            {
              type: ApplicationCommandOptionType.Attachment,
              name: 'token',
              description: 'Upload a token for your character',
              required: false,
            },
          ],
        },
        {
          name: 'remove',
          description: 'Remove a character',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'name',
              description: 'The event to copy',
              required: true,
              autocomplete: true,
            },
          ],
        },
      ],
    });

    this.database = client.database;
  }

  // async execute({ interaction }) {
  //   // subcommand groups
  //   const subcommandGroup = interaction.options.getSubcommandGroup();

  //   if (subcommandGroup === 'character') {
  //     await this.character({ interaction });
  //   }
  // }

  // Manage Subcommand Group
  async execute({ interaction }) {
    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);
      // if field is an autocomplete, retrieve valid options
      // this has no effect on non-autocomplete fields of the same name
      if (focusedOption?.name === 'name') {
        const characters = await this.database.getCharacters({ userId: interaction.user?.id, guildId: interaction.guild?.id });
        await interaction.respond(autocompleteOptions(characters, 'id', 'name', focusedOption?.value));

        return;
      }
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await this.create({ interaction });
      return;
    }

    if (subcommand === 'select') {
      await this.select({ interaction });
      return;
    }

    if (subcommand === 'remove') {
      await this.remove({ interaction });
      return;
    }

    if (subcommand === 'edit') {
      await this.edit({ interaction });
    }
  }

  async create({ interaction }) {
    const name = interaction.options.getString('name');
    const token = interaction.options.getAttachment('token') ?? { attachment: DEFAULT_TOKEN };
    await interaction.deferReply({ ephemeral: true });
    const newCharacter = {
      id: `${this.database.uuid()}`,
      userId: interaction.user?.id,
      guildId: interaction.guild?.id,
      name,
      token,
    };

    const response = await this.database.createCharacter(newCharacter);

    await interaction.editReply({
      content: `Character Created -> ${JSON.stringify(response, null, 2)}`,
    });
  }

  async select({ interaction }) {
    const id = interaction.options.getString('name');
    await interaction.deferReply({ ephemeral: true });

    const oldCharacter = await this.database.getCharacter({
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      channelId: interaction.channel?.isThread() ? interaction.channel?.parent.id : interaction.channel?.id,
    });

    if (oldCharacter?.id) {
      await this.database.setCharacter({
        id: oldCharacter.id, userId: interaction.user.id, channelId: undefined, threadId: undefined,
      });
    }

    const character = await this.database.setCharacter({
      id,
      channelId: interaction.channel?.isThread() ? interaction.channel?.parent.id : interaction.channel?.id,
    });

    await interaction.editReply({
      content: `Character Moved to this Channel -> ${JSON.stringify(character, null, 2)}`,
    });
  }

  async remove({ interaction }) {
    const id = interaction.options.getString('name');
    await interaction.deferReply({ ephemeral: true });
    const character = await this.database.deleteCharacter({ id, userId: interaction.user.id, guildId: interaction.guild?.id });

    await interaction.editReply({
      content: `Character Removed -> ${JSON.stringify(character, null, 2)}`,
    });
  }

  async edit({ interaction }) {
    const id = interaction.options.getString('name');
    const name = interaction.options.getString('new_name');
    const token = interaction.options.getAttachment('token');

    await interaction.deferReply({ ephemeral: true });
    let character = await this.database.getCharacter({ id, userId: interaction.user.id, guildId: interaction.guild?.id });
    character = await this.database.setCharacter({ id, name, token });

    await interaction.editReply({
      content: `Character Edited -> ${JSON.stringify(character, null, 2)}`,
    });
  }
}
