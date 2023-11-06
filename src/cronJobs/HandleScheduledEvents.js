import { CronJob } from '../structures/CronJob.js';
import { GuildScheduledEventStatus } from 'discord.js';

const MINUTE = 1000 * 60;

export default class HandleScheduledEvents extends CronJob {
  constructor() {
    super();
    this.schedule = '* * * * *';
  }

  async execute(client) {
    await this.startEvents(client);
    await this.endEvents(client);
  }

  async startEvents(client) {
    const guilds = await client.guilds.cache;
    guilds?.forEach(async guild => {
      const allScheduledEvents = await guild?.scheduledEvents?.fetch();
      const startingScheduledEvents = allScheduledEvents
        ?.filter(ev => MINUTE > (new Date(ev.scheduledStartTimestamp).getTime() - Date.now()));
      startingScheduledEvents
        ?.forEach((ev) => ev.setStatus(GuildScheduledEventStatus.Active));
    });
  }

  async endEvents(client) {
    const guilds = await client.guilds.cache;

    guilds?.forEach(async guild => {
      const allCurrentEvents = await guild?.scheduledEvents?.fetch();
      const activeEvents = allCurrentEvents
        ?.filter(ev => ev.status === GuildScheduledEventStatus.Active);
      const emptyActiveEvents = activeEvents
        ?.filter(ev => ev.voiceChannel.members.size === 0);
      emptyActiveEvents
        ?.forEach((ev) => ev.setStatus(GuildScheduledEventStatus.Completed));
      // filer down to active events
      // filter down to events that are in empty voice channels
      // stop the filtered events
    });
  }
}
