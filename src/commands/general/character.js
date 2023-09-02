import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { Command } from '../../structures/Command.js';

const DEFAULT_TOKEN = 'https://www.worldanvil.com/uploads/images/0698a091e4f1360c364f76c24046d69f.png';

export const autocompleteOptions = (options, idkey, valkey, value) => {
  const filteredOptionList = value
    ? options.filter((opt) => opt[valkey].toLowerCase().includes(value.toLowerCase()))
    : options;

  const mappedOptions = filteredOptionList
    .map((opt) => ({ name: `${opt?.[valkey]}`, value: `${opt?.[idkey]}` }));

  return mappedOptions?.slice?.(0, 24) ?? [];
};

export const makeCharacterWebhook = async (interaction, database) => {
  const isThread = interaction?.channel?.isThread();
  const character = isThread
    ? await database.getCharacter({ userId: interaction.user?.id, channelId: interaction?.channel.parent.id })
    : await database.getCharacter({ userId: interaction.user?.id, channelId: interaction?.channel.id });
  const webhook = await interaction.guild?.channels.createWebhook({
    name: character?.name,
    avatar: character?.token?.attachment ?? DEFAULT_TOKEN,
    channel: interaction?.channelId,
    reason: 'Character Command',
  });

  return webhook;
};

// TODO: autostart events with node-cron and cron.schedule
export default class CharacterCommand extends Command {
  constructor(client) {
    super(client, {
      // Gameplay Commands
      name: 'character',
      description: 'Manage your Characters',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'say',
          description: 'Say something in character',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'quote',
              description: 'The text your avatar will say',
              required: true,
            },
          ],
        },

        // {
        //   name: 'do',
        //   description: 'Describe what your character does',
        //   type: ApplicationCommandOptionType.Subcommand,
        //   options: [
        //     {
        //       type: ApplicationCommandOptionType.String,
        //       name: 'description',
        //       description: 'A short description of what your character is doing',
        //       required: true,
        //     },
        //   ],
        // },

        // {
        //   name: 'move',
        //   description: 'Move in Character by clicking the D-Pad',
        //   type: ApplicationCommandOptionType.Subcommand,
        // },

        // Manage Commands
        {
          name: 'manage',
          description: 'Create, Update, or Remove a Character',
          type: ApplicationCommandOptionType.SubcommandGroup,
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
        },
      ],
    });

    this.database = client.database;
  }

  async execute({ interaction }) {
    const subcommand = interaction.options.getSubcommand();

    // subcommands
    if (subcommand === 'say') {
      await this.say({ interaction });
      return;
    }

    // subcommand groups
    const subcommandGroup = interaction.options.getSubcommandGroup();

    if (subcommandGroup === 'manage') {
      this.manage({ interaction });
    }
  }

  async say({ interaction }) {
    const quote = interaction.options.getString('quote');
    await interaction.deferReply();
    const webhook = await makeCharacterWebhook(interaction, this.database);
    if (!webhook) {
      return;
    }
    await interaction.deleteReply();
    await webhook.send(`${quote}`);
    await webhook.delete();
  }

  async manage({ interaction }) {
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
    let character = await this.database.getCharacter({ id, userId: interaction.user.id, guildId: interaction.guild?.id });
    character = await this.database.setCharacter({
      id,
      channelId: interaction.channel?.isThread() ? interaction.channel?.parent.id : interaction.channel?.id,
      threadId: interaction.channel?.isThread() ? interaction.channel?.parent.id : undefined,
    });

    await interaction.editReply({
      content: `Character Move to this Channel -> ${JSON.stringify(character, null, 2)}`,
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
