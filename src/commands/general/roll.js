import { diceRoller } from 'dnd5e-dice-roller';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command.js';

export default class TimestampCommand extends Command {
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
        },
      ],
    });
  }

  execute({ interaction }) {
    const rollString = interaction.options.getString('roll_string');
    const rollResult = diceRoller(rollString);
    return interaction.reply({
      content: `\`${rollResult.rollStr}\` => \`${rollResult.rolls}\` => \`${rollResult.total}\``,
    });
  }
}
