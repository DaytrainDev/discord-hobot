import { Event } from '../structures/Event.js';
import OpenAIApi from 'openai';
import { getChannelMessages } from '../utils/openAiHelpers.js';

export default class MessageCreate extends Event {
  constructor() {
    super();
    this.eventName = 'messageCreate';
    this.openAi = new OpenAIApi({
      organization: process.env.OPENAI_ORG_ID,
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.activeChannels = new Map();
  }

  async botResponse({ interaction }) {
    try {
      const channel = interaction?.channel;
      const pendingRequest = this.activeChannels?.get(channel?.id);
      if (pendingRequest) {
        Promise.reject(pendingRequest);
      }

      channel.sendTyping();
      const messagesPromise = getChannelMessages(interaction);
      this.activeChannels.set(channel?.id, messagesPromise);
      const messages = await messagesPromise;
      if (!messages) {
        return;
      }

      // add prompt
      // TODO: read server description into prompt
      messages.unshift({
        role: 'user',
        content: `Assume the role of ${process.env.BOT_NAME}, ${process.env.BOT_BASE_PROMPT ?? 'a chat bot on a Discord Server. Offer answers with brief examples and suggestions when possible.'}`,
      });

      const completionPromise = this.openAi.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo',
        max_tokens: 400,
      }).then(rawResponse => rawResponse?.choices?.[0]?.message?.content);
      this.activeChannels.set(channel?.id, completionPromise);
      const completion = await completionPromise;

      if (!completion) {
        return;
      }
      const replyPromise = channel?.send(completion);
      this.activeChannels.set(channel?.id, replyPromise);
      await replyPromise;

      this.activeChannels.delete(channel?.id);
    } catch (err) {
      console.error(err);
    }
  }

  async execute(client, interaction) {
    // if (!(interaction.isChatInputCommand() || interaction.isAutocomplete)) return;
    // const command = client.commands.getCommand(interaction.commandName);
    // await command?.execute({ interaction });
    if (interaction.content.includes(`${process.env.BOT_APP_ID}`)) {
      await this.botResponse({ interaction });
    }
  }
}
