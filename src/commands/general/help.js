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
          description: `A list of ${process.env.BOT_NAME} commands.`,
          fields: [
            {
              name: `@${process.env.BOT_NAME}`,
              value: `@ mention ${process.env.BOT_NAME} and it will reply`,
            },
            // {
            //   name: '/play',
            //   value: 'Lets you speak, act, and move as your character',
            // },
            // {
            //   name: '/options',
            //   value: 'Manage your characters and other settings',
            // },
            {
              name: '/write',
              value: 'Writes some text in response to a prompt',
            },
            {
              name: '/imagine',
              value: 'Generates an image in response to a prompt',
            },
            // {
            //   name: '/roll',
            //   value: 'A simple dice roller',
            // },
            // {
            //   name: '/timestamp',
            //   value: 'Reads a date and returns a timestamp',
            // },
          ],
        },
      ],
      ephemeral: true,
    });
  }
}
