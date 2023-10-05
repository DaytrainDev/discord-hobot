import {
  ApplicationCommandType, ApplicationCommandOptionType,
} from 'discord.js';
import { Command } from '../../structures/Command.js';
import puppeteer from 'puppeteer';

export default class ShowUrlCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'showurl',
      description: 'Play video in the current voice channel.',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'url',
          description: 'URL to show; remember to include `https://` at the beginning.',
          required: true,
        },
      ],
    });
  }

  async execute({ interaction }) {
    await interaction.deferReply();
    const url = interaction.options.getString('url');
    this.browser = await puppeteer.launch({ headless: 'new' });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    try {
      await this.page.goto(url);
      await this.page.waitForNetworkIdle();
      const imageBuffer = await this.page.screenshot({ type: 'jpeg' });
      await interaction.followUp({
        content: `Showing ${url}`,
        files: [
          {
            // name: this.page.title ?? 'show-url.jpg',
            name: 'show-url.jpg',
            attachment: imageBuffer,
          },
        ],
      });
    } catch (err) {
      await interaction.followUp({
        content: `Error showing page at ${url}. Please check the URL and try again.`,
      });
    }
  }
}
