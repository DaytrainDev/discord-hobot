import { ApplicationCommandType } from 'discord.js';
import { Command } from '../../structures/Command.js';

export default class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'A summary of commands.',
      type: ApplicationCommandType.ChatInput,
    });
  }

  execute({ interaction }) {
    interaction.reply({
      embeds: [
        {
          color: 0x7289da,
          title: 'Commands',
          description: 'A list of FumbleBot commands.',
          fields: [
            {
              name: 'timestamp',
              value: 'Reads a date and returns a timestamp',
            },
          ],
        },
      ],
      ephemeral: true,
    });
  }
}
