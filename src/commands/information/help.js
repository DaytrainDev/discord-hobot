import { ActionRowBuilder, ButtonBuilder, ApplicationCommandType, ButtonStyle } from 'discord.js';
import { Command } from '../../structures/Command.js';

export default class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'Help fds',
      type: ApplicationCommandType.ChatInput,
    });
  }

  execute({ interaction }) {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder() 
      .setLabel(`Entre no servidor de suporte!`)
.setStyle(ButtonStyle.Link)
.setURL('https://discord-logo.jpg'))
    interaction.reply({
      embeds: [
        {
          color: '#7289da',
          title: '🤨 Comandos (Utils):',
          description: `Bem vindo **${interaction.user.tag}** ao meu painel de ajuda.`
        }
      ],
      components: [row]
    })
  }
}
