import {
  ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, ComponentType,
} from 'discord.js';
import { Command } from '../../structures/Command.js';
import Canvas from '@napi-rs/canvas';

export const DEFAULT_TOKEN = 'https://www.worldanvil.com/uploads/images/0698a091e4f1360c364f76c24046d69f.png';

const emojis = {
  play_move_upper_left: '↖️',
  play_move_up: '⬆️',
  play_move_upper_right: '↗️',
  play_move_left: '⬅️',
  play_move_stop: '🛑',
  play_move_right: '➡️',
  play_move_lower_left: '↙️',
  play_move_down: '⬇️',
  play_move_lower_right: '↘️',
};

const moves = {
  play_move_upper_left: { x: -1, y: -1 },
  play_move_up: { x: 0, y: -1 },
  play_move_upper_right: { x: 1, y: -1 },
  play_move_left: { x: -1, y: 0 },
  play_move_stop: { x: 0, y: 0 },
  play_move_right: { x: 1, y: 0 },
  play_move_lower_left: { x: -1, y: 1 },
  play_move_down: { x: 0, y: 1 },
  play_move_lower_right: { x: 1, y: 1 },
};

const controlPad = [
  {
    type: ComponentType.ActionRow,
    components: Object.keys(emojis).slice(0, 3).map((key) => ({
      style: 1,
      label: emojis[key],
      custom_id: key,
      disabled: false,
      type: ComponentType.Button,
    })),
  },
  {
    type: ComponentType.ActionRow,
    components: Object.keys(emojis).slice(3, 6).map((key) => ({
      style: 1,
      label: emojis[key],
      custom_id: key,
      disabled: false,
      type: ComponentType.Button,
    })),
  },
  {
    type: ComponentType.ActionRow,
    components: Object.keys(emojis).slice(6, 9).map((key) => ({
      style: 1,
      label: emojis[key],
      custom_id: key,
      disabled: false,
      type: ComponentType.Button,
    })),
  },
];

async function getToken(interaction, database) {
  const isThread = interaction?.channel?.isThread();
  const character = isThread
    ? await database.getCharacter({ userId: interaction.user?.id, channelId: interaction?.channel.parent.id })
    : await database.getCharacter({ userId: interaction.user?.id, channelId: interaction?.channel.id });
  const token = character?.token?.url ?? DEFAULT_TOKEN;

  return token;
}

async function getScreen({ interaction, position }) {
  const tileSize = 50;
  const width = 17;
  const height = 13;
  const canvas = Canvas.createCanvas(width * tileSize, height * tileSize);
  const context = canvas.getContext('2d');
  const player = await Canvas.loadImage(await getToken(interaction, this.database));
  context.lineWidth = 4;
  context.strokeStyle = '#eeeeee';
  context.fillStyle = '#616161';
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  context.drawImage(player, position.x * tileSize, position.y * tileSize, tileSize, tileSize);

  return new AttachmentBuilder(await canvas.encode('jpeg'), { name: 'display.jpg' });
}

export default class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      description: 'Test commands',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'canvas',
          description: 'Test the canvas',
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    });

    this.database = client.database;
  }

  execute({ interaction }) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'canvas') {
      return this.canvas({ interaction });
    }

    return null;
  }

  async canvas({ interaction }) {
    // https://www.npmjs.com/package/@napi-rs/canvas
    // https://discordjs.guide/popular-topics/canvas.html#setting-up-napi-rs-canvas
    // https://donjon.bin.sh/code/dungeon/
    await interaction.deferReply({ ephemeral: true });
    const position = { x: 8, y: 6 };

    const input = await interaction.editReply({
      content: '',
      files: [await getScreen({ interaction, position })],
      components: controlPad,
    });

    const collector = input.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

    collector.on('collect', async (i) => {
      if (i.customId !== 'play_move_stop') {
        position.x += moves[i.customId].x;
        position.y += moves[i.customId].y;
        await interaction.editReply({
          files: [await getScreen({ interaction, position })],
          components: controlPad,
        });
        collector.resetTimer();
      } else {
        collector.stop();
      }
      await i.deferUpdate();
    });

    collector.on('end', async () => {
      await interaction.deleteReply();
    });
  }
}
