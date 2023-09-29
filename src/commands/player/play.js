import { ApplicationCommandOptionType, ApplicationCommandType, ComponentType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { makeCharacterWebhook } from '../../utils/gameplayHelpers.js';
import { diceRoller } from 'dnd5e-dice-roller';

export const autocompleteOptions = (options, idkey, valkey, value) => {
  const filteredOptionList = value
    ? options.filter((opt) => opt[valkey].toLowerCase().includes(value.toLowerCase()))
    : options;

  const mappedOptions = filteredOptionList
    .map((opt) => ({ name: `${opt?.[valkey]}`, value: `${opt?.[idkey]}` }));

  return mappedOptions?.slice?.(0, 24) ?? [];
};

// TODO: autostart events with node-cron and cron.schedule

export default class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      // Gameplay Commands
      name: 'play',
      description: 'Speak, act or move as your character',
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
        {
          name: 'do',
          description: 'Declare an action',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'description',
              description: 'Ex:`I make my 1st attack on the wolf`, `I investigate the alleyway``',
              required: true,
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'roll_string',
              description: 'Ex:`1d12+5`, `2d20kl1 + 1d4 + 4`',
            },
          ],
        },

        {
          name: 'move',
          description: 'Move in Character by clicking the D-Pad',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'description',
              description: 'Ex:`I run  30 ft towards the river`, `I move 5 ft to the left`',
              required: true,
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

    if (subcommand === 'do') {
      await this.do({ interaction });
      return;
    }

    if (subcommand === 'move') {
      await this.move({ interaction });
    }
  }

  // Act in Character Commands
  async say({ interaction }) {
    const quote = interaction.options.getString('quote');

    await interaction.deferReply();
    const webhook = await makeCharacterWebhook(interaction, this.database);
    if (!webhook) {
      interaction.editReply({ content: 'No character assigned to this channel. Use `/option character select` to select a character.' });
      return;
    }

    await webhook.send(`> ${quote}`);
    await webhook.delete();
    await interaction.deleteReply();
  }

  async do({ interaction }) {
    const rollDescription = interaction.options.getString('description');
    const rollString = interaction.options.getString('roll_string');

    await interaction.deferReply({ ephemeral: true });
    let rollResult;
    try {
      rollResult = diceRoller(rollString);
    } catch (e) {
      // consume, we'll just send the description
    }

    const content = `*${rollDescription}*${rollResult?.rollStr
      ? `\n\`${rollResult.rollStr}\` => \`${rollResult.rolls}\` => \`${rollResult.total}\``
      : ''
    }`;

    const webhook = await makeCharacterWebhook(interaction, this.database);

    if (!webhook) {
      interaction.editReply({ content: 'No character assigned to this channel. Use `/option character select` to select a character.' });
      return;
    }

    await webhook.send(`${content}`);
    await webhook.delete();
    await interaction.deleteReply();
  }

  async move({ interaction }) {
    const desc = interaction.options.getString('description');

    await interaction.deferReply({ ephemeral: true });
    const emojis = {
      play_move_upper_left: '↖️',
      play_move_up: '⬆️',
      play_move_upper_right: '↗️',
      play_move_left: '⬅️',
      play_move_stop: '🛑',
      play_move_right: '➡️',
      play_move_lower_left: '↙️',
      play_move_down: '⬇️',
      play_move_lower_right: '↘️',
    };

    const controlPad = [
      {
        type: 1,
        components: Object.keys(emojis).slice(0, 3).map((key) => ({
          style: 1,
          label: emojis[key],
          custom_id: key,
          disabled: false,
          type: 2,
        })),
      },
      {
        type: 1,
        components: Object.keys(emojis).slice(3, 6).map((key) => ({
          style: 1,
          label: emojis[key],
          custom_id: key,
          disabled: false,
          type: 2,
        })),
      },
      {
        type: 1,
        components: Object.keys(emojis).slice(6, 9).map((key) => ({
          style: 1,
          label: emojis[key],
          custom_id: key,
          disabled: false,
          type: 2,
        })),
      },
    ];

    const input = await interaction.editReply({
      content: 'Input your movement using the directional buttons below.',
      components: controlPad,
    });

    let content = '';
    const collector = input.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

    collector.on('collect', async (i) => {
      if (i.customId !== 'play_move_stop') {
        content += `${emojis[i.customId]}`;
        await interaction.editReply(`\`Movement: ${content}\``);
        collector.resetTimer();
      } else {
        await interaction.editReply({ content: 'One moment...', components: [] });
        collector.stop();
      }
      await i.deferUpdate();
    });

    collector.on('end', async () => {
      if (!content) {
        await interaction.editReply({ content: 'No movement entered.', components: [] });
        return;
      }
      const webhook = await makeCharacterWebhook(interaction, this.database);
      if (!webhook) {
        interaction.editReply({ content: 'No character assigned to this channel. Use `/option character select` to select a character.' });
        return;
      }

      content = `\`Movement: ${content}\`\n*${desc}*`;
      if (!webhook) {
        await interaction.editReply({ content, components: [] });
        return;
      }
      await webhook.send(content);
      await webhook.delete();
      await interaction.deleteReply();
    });
  }
}
