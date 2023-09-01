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
    const scheduledEvents = await (guild?.scheduledEvents?.cache || guild?.scheduledEvents?.fetch());
    const eventList = scheduledEvents
      ?.sorted((ev1, ev2) => (
        (ev2.scheduledStartTimestamp ?? 0) > (ev1.scheduledStartTimestamp ?? 0) ? 1 : -1
      ));
    // const eventList = await scheduledEvents?.cache?.sorted((ev1, ev2) => ((ev2.scheduledStartTimestamp ?? 0) > (ev1.scheduledStartTimestamp ?? 0) ? 1 : -1));

    if (!eventList) {
      return ([{ name: 'No Events Found', value: null }]);
    }

    const eventId = interaction.options.getString('source');
    const when = interaction.options.getString('when');

    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);
      // TODO: filter by partial name off focusedOption.value
      if (focusedOption?.name === 'source') {
        const filteredEventList = focusedOption.value ? eventList.filter(ev => ev.name.toLowerCase().includes(focusedOption.value.toLowerCase())) : eventList;
        const mappedOptions = filteredEventList
          .map(opt => {
            const ts = opt.scheduledStartTimestamp;
            if (!ts) {
              return ({ name: `${opt?.name}`, value: `${opt?.id}` });
            }
            const date = new Date(ts);
            const formattedDate = `${date.toLocaleDateString('en-US')} @ ${date.toLocaleTimeString(interaction.locale)}`;
            return ({ name: `${opt?.name} (${formattedDate})`, value: `${opt?.id}` });
          });
        const trimmedOptions = mappedOptions.slice(0, 24);
        // focusedOption.choices = trimmedOptions;
        await interaction.respond(
          trimmedOptions ?? [],
        );
      }

      return null;
    }
    await interaction.deferReply({ ephemeral: true });

    if (!eventList) {
      return interaction.editReply({ content: 'No Events Found.' });
    }

    const event = eventList?.find(ev => ev.id === eventId);

    if (!event?.name
      || !event?.scheduledStartTimestamp
    ) {
      return interaction.editReply({ content: `Found Incomplete Event\n\`\`\`${JSON.stringify(event, null, 2)}\`\`\`` });
    }

    // interaction.editReply({ content: `Found Event\n\`\`\`${JSON.stringify(event, null, 2)}\`\`\``});

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
      // TODO: figure out how to fix image
      image: event?.coverImageURL({ size: 512 }) ?? undefined,
    };

    if (when) {
      const parsedDate = chrono.parseDate(when);
      if (!parsedDate || !parsedDate.getTime) {
        return interaction.editReply({ content: `Could read date -> \`\`\`${JSON.stringify({ when, parsedDate }, null, 2)}\`\`\`` });
      }
      const scheduledStartTime = parsedDate.getTime();
      newEvent = {
        ...newEvent,
        scheduledStartTime,
      };
    }

    // interaction.editReply({ content: `New Event Data\n\`\`\`${JSON.stringify(newEvent, null, 2)}\`\`\``});

    const createdEvent = await guild?.scheduledEvents?.create(newEvent).catch(err => interaction.editReply({ content: `Error Creating Event\n\`\`\`${JSON.stringify(err, null, 2)}\`\`\`\n\`\`\`${JSON.stringify(newEvent, null, 2)}\`\`\`` }));

    if (!createdEvent?.id) {
      return null;
    }

    return interaction.editReply({ content: `Created Event -> [${name}](${createdEvent})\n\`\`\`${JSON.stringify(createdEvent, null, 2)}\`\`\`` });
  }
}
