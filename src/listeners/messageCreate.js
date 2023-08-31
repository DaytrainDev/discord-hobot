import { Event } from '../structures/Event.js';
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai';
import { getChannelMessages } from '../utils/openAiHelpers.js';

export default class InteractionCreate extends Event {
  constructor() {
    super();
    this.eventName = 'messageCreate';
    this.openAi = new OpenAIApi(new Configuration({
      organization: process.env.OPENAI_ORG_ID,
      apiKey: process.env.OPENAI_API_KEY,
    }));
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
      messages.unshift({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Assume the role of FumbleBot, a chat bot on the TTRPG and Co-op Gaming Community, Crit Fumble Gaming's (CFG), Discord Server. ${'Contribute, comment, or assist as needed.'}`,
      });

      const completionPromise = this.openAi.createChatCompletion({
        messages,
        model: 'gpt-3.5-turbo',
        max_tokens: 500,
      }).then(rawResponse => rawResponse?.data?.choices?.[0]?.message?.content);
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

    return null;
  }
}
