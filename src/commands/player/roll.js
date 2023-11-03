import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';

export default class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      description: 'Makes a dice roll',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'roll_string',
          description: 'Ex:`1d12+5`, `2d20kl1 + 1d4 + 4`, `2d20kh1 - 2`',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'roll_description',
          description: 'Ex:`I cast lightning bolt at the three orcs!`',
        },
      ],
    });
  }

  execute({ interaction }) {
    const rollString = interaction.options.getString('roll_string');
    const rollDescription = interaction.options.getString('roll_description');
    try {
      const rollResult = new DiceRoll(rollString);
      const content = `${rollDescription ? `${rollDescription}\n` : ''}\`${rollResult.output}\``;

      return interaction.reply({ content });
    } catch (err) {
      return interaction.reply({ ephemeral: true, content: `\`${rollString}\` is not a valid roll_string, or something else went wrong. Please try again.` });
    }
  }
}
