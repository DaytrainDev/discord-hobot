import { diceRoller } from 'dnd5e-dice-roller';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command.js';

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
          description: 'Ex:`1d12+5`, `2d20kl1 + 1d4 + 4`',
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
    const rollResult = diceRoller(rollString);
    const content = `${rollDescription ? `${rollDescription}\n` : ''}\`${rollResult.rollStr}\` => \`${rollResult.rolls}\` => \`${rollResult.total}\``;

    return interaction.reply({ content });
  }
}
