import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import OpenAIApi from 'openai';

export default class WriteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'write',
      description: 'Writes some text in response to a prompt',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'prompt',
          description: 'The prompt to respond to',
        },
      ],
    });
  }

  async execute({ interaction }) {
    const prompt = interaction.options.getString('prompt');
    await interaction.deferReply();

    const openAi = new OpenAIApi({
      organization: process.env.OPENAI_ORG_ID,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const rawResponse = await openAi.chat.completions.create({
      // TODO: check prompt for token count, return error if too large
      messages: [{
        role: 'user',
        content: prompt,
      }],
      model: 'gpt-3.5-turbo',
      user: interaction?.user?.id,
      max_tokens: 250,
    });

    // TODO: limit character count to 2000 for discord messages, chuck response into multiple messages, embeds, or a thread.
    // TODO: increase token limit in request once above is complete
    console.log(rawResponse);
    const response = rawResponse?.choices?.[0]?.message?.content;

    return interaction.followUp({
      content: response,
      embeds: [{
        title: `> ${prompt}`,
      }],
    });
  }
}
