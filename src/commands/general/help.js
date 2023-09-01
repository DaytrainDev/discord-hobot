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
              name: `@FumbleBot`,
              value: '@ mention FumbleBot and it will reply',
            },
            {
              name: '/timestamp',
              value: 'Reads a date and returns a timestamp',
            },
            {
              name: '/write',
              value: 'Generates an image in response to a prompt',
            },
            {
              name: '/imagine',
              value: 'Writes some text in response to a prompt',
            },
          ],
        },
      ],
      ephemeral: true,
    });
  }
}
