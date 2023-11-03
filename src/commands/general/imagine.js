import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import OpenAIApi from 'openai';

export default class ImagineCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'imagine',
      description: 'Generates an image in response to a prompt',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'prompt',
          description: 'The prompt to respond to',
          required: true,
        },
        {
          name: 'size',
          description: 'Size of the generated image',
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: '256x256',
              value: '256x256',
            },
            {
              name: '512x512',
              value: '512x512',
            },
            {
              name: '1024x1024',
              value: '1024x1024',
            },
          ],
        },
      ],
    });
  }

  async execute({ interaction }) {
    const prompt = interaction.options.getString('prompt');
    const size = interaction.options.getString('size') ?? '256x256';

    await interaction.deferReply();
    const openAi = new OpenAIApi({
      organization: process.env.OPENAI_ORG_ID,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const rawResponse = await openAi.images.generate({
      prompt,
      size,
      n: 1,
      response_format: 'url',
      user: interaction?.user?.id,
    });

    const response = rawResponse?.data?.[0];

    if (!response?.url) {
      interaction.followUp({ content: 'Something went wrong, ping an admin for help' });
      return;
    }

    interaction.followUp({
      content: `[Link to Image](${response?.url})`,
      embeds: [{
        title: 'Generated Image',
        description: `${prompt}`,
        image: {
          url: `${response?.url}`,
          height: 256,
          width: 256,
        },
      }],
    });
  }
}
