import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import * as chrono from 'chrono-node';

export default class TimestampCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'timestamp',
      description: 'Reads a date and returns a timestamp',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'datetime',
          description: 'Ex:`2019-01-01T00:00:00`',
        },
      ],
    });
  }

  execute({ interaction }) {
    const now = Math.floor(Date.now() / 1000);

    const dateString = interaction.options.getString('datetime');
    const parseDate = (dateString ? (chrono.parseDate(dateString).valueOf() / 1000) : now);
    if (Number.isNaN(parseDate)) {
      return interaction.editReply({
        content: `\`${dateString}\` is not a valid date/time. See [Date.parse() JavaScript Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)`,
      });
    }
    const tsTag = `<t:${parseDate}>`;

    return interaction.reply({
      content: `\`${tsTag}\``,
      ephemeral: true,
    });
  }
}
