import { CronJob } from '../structures/CronJob.js';
import { GuildScheduledEventStatus } from 'discord.js';

const MINUTE = 1000 * 60;

export default class StartEvent extends CronJob {
  constructor() {
    super();
    this.schedule = '* * * * *';
  }

  async execute(client) {
    const guilds = await client.guilds.cache;
    guilds?.forEach(async guild => {
      console.log(guild?.scheduledEvents);
      const allScheduledEvents = await guild?.scheduledEvents?.fetch();
      console.log(allScheduledEvents);
      const startingScheduledEvents = allScheduledEvents
        ?.filter(ev => MINUTE > (new Date(ev.scheduledStartTimestamp).getTime() - Date.now()));
      console.log(startingScheduledEvents);
      startingScheduledEvents
        ?.forEach((ev) => ev.setStatus(GuildScheduledEventStatus.Active));
    });
  }
}
