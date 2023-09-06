import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { Command } from '../../structures/Command.js';
import * as chrono from 'chrono-node';

// TODO: autostart events with node-cron and cron.schedule
export default class EventCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'event',
      description: 'Manage Discord events',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'clone',
          description: 'Clone an existing Discord event',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'source',
              description: 'The event to copy',
              required: true,
              autocomplete: true,
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'when',
              description: 'When the cloned event is scheduled to start',
              required: false,
            },
          ],
        },
      ],
    });
  }

  execute({ interaction }) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'clone') {
      return this.clone({ interaction });
    }

    return null;
  }

  async clone({ interaction }) {
    const guild = interaction?.guild;
    // NOTE: Don't await this fetch. Discord needs an autocomplete response within 3 seconds and this can take longer
    // can grab from refreshed cache as needed
    guild?.scheduledEvents?.fetch();
    const eventId = interaction.options.getString('source');
    const when = interaction.options.getString('when');

    if (interaction.isAutocomplete()) {
      const focusedOption = interaction?.options?.getFocused(true);

      if (focusedOption?.name === 'source') {
        const eventList = guild?.scheduledEvents?.cache
          ?.sorted((ev1, ev2) => (
            (ev2?.scheduledStartTimestamp ?? 0) > (ev1?.scheduledStartTimestamp ?? 0) ? 1 : -1
          ));

        if (!eventList || eventList?.size === 0) {
          return;
        }

        const filteredEventList = (focusedOption.value.length > 0)
          ? eventList.filter(ev => ev?.name?.toLowerCase()?.includes(focusedOption?.value?.toLowerCase()))
          : eventList;
        const mappedOptions = filteredEventList.filter(ev => ev.name && ev.id)
          .map(opt => {
            const ts = opt.scheduledStartTimestamp;
            if (!ts) {
              return ({ name: `${opt?.name}`, value: `${opt?.id}` });
            }
            const date = new Date(ts);
            const formattedDate = `${date.toLocaleDateString(interaction?.locale)} @ ${date.toLocaleTimeString(interaction?.locale)}`;
            return ({ name: `${opt?.name} (${formattedDate})`, value: `${opt?.id}` });
          });
        const trimmedOptions = mappedOptions.slice(0, 24);
        // focusedOption.choices = trimmedOptions;
        await interaction.respond(
          trimmedOptions ?? [],
        );
      }

      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const event = guild?.scheduledEvents?.cache?.find(ev => ev.id === eventId);

    const name = `${event?.name}`;
    let newEvent = {
      name,
      scheduledStartTime: event?.scheduledStartTimestamp ?? undefined,
      scheduledEndTime: event?.scheduledEndTimestamp ?? undefined,
      privacyLevel: event?.privacyLevel ?? undefined,
      entityType: event?.entityType ?? undefined,
      description: event?.description ?? undefined,
      channel: event?.channel ?? undefined,
      entityMetadata: event?.entityMetadata?.location ? {
        location: event?.entityMetadata?.location,
      } : undefined,
      image: event?.coverImageURL({ size: 512 }) ?? undefined,
    };

    if (when) {
      const parsedDate = chrono.parseDate(when, { timezone: interaction?.locale });
      if (!parsedDate || !parsedDate.getTime) {
        interaction.editReply({ content: `Could read date -> \`\`\`${JSON.stringify({ when, parsedDate }, null, 2)}\`\`\`` });
        return;
      }
      const scheduledStartTime = parsedDate.getTime();
      newEvent = {
        ...newEvent,
        scheduledStartTime,
      };
    }

    const createdEvent = await guild?.scheduledEvents?.create(newEvent)
      .catch(err => interaction.editReply({ content: `Error Creating Event\n\`\`\`${JSON.stringify(err, null, 2)}\`\`\`\n\`\`\`${JSON.stringify(newEvent, null, 2)}\`\`\`` }));

    if (!createdEvent?.id) {
      return;
    }

    interaction.editReply({ content: `Created Event -> [${name}](${createdEvent})\n\`\`\`${JSON.stringify(createdEvent, null, 2)}\`\`\`` });
  }
}
