import { encode } from 'gpt-3-encoder';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

export function countTokens(messages) {
  return messages.flatMap(mes => {
    if (!mes?.content) {
      return [];
    }
    return encode(mes?.content);
  })?.length;
}

export function trimMessages(messages) {
  const newMessages = [...(messages?.values() ?? messages)];
  const maxTokens = 3500; // 4097 max between context and response
  // let tokenCount = newMessages.flatMap((mes) => encode(mes?.content))?.length.join('\n\n');
  let tokenCount = countTokens(newMessages);
  do {
    tokenCount = countTokens(newMessages);
    if (tokenCount > maxTokens) {
      newMessages.shift();
    }
  } while (tokenCount > maxTokens);

  return newMessages;
}

export function formatMessages(messages) {
  const newMessages = messages;

  return newMessages?.filter((mes) => mes?.content)?.map((mes) => {
    if (mes?.author?.id === process.env.BOT_APP_ID) {
      return {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: `${mes?.content}`,
      };
    }
    return {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `${mes?.content}`,
    };
  }) ?? [];
}

export async function getChannelMessages(interaction) {
  const rawMessagesPromise = interaction?.channel?.messages.fetch({ limit: 32 });
  const rawMessages = await rawMessagesPromise;
  return formatMessages(trimMessages(rawMessages.reverse()));
}
