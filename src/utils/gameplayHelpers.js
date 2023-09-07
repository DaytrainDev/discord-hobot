export const DEFAULT_TOKEN = 'https://www.worldanvil.com/uploads/images/0698a091e4f1360c364f76c24046d69f.png';

export const makeCharacterWebhook = async (interaction, database) => {
  const isThread = interaction?.channel?.isThread();
  const character = isThread
    ? await database.getCharacter({ userId: interaction.user?.id, channelId: interaction?.channel.parent.id })
    : await database.getCharacter({ userId: interaction.user?.id, channelId: interaction?.channel.id });
  if (character?.id) {
    const webhook = await interaction.guild?.channels.createWebhook({
      name: character?.name,
      avatar: character?.token?.attachment ?? DEFAULT_TOKEN,
      channel: interaction?.channelId,
      reason: 'Character Command',
    });

    return webhook;
  }

  return null;
};
