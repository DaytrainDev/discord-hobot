import { Event } from '../structures/Event.js';

export default class InteractionCreate extends Event {
  constructor() {
    super();
    this.eventName = 'interactionCreate';
  }

  async execute(client, interaction) {
    if (!(interaction.isChatInputCommand() || interaction.isAutocomplete)) return;

    const command = client.commands.getCommand(interaction.commandName);

    await command?.execute({ interaction });
  }
}
