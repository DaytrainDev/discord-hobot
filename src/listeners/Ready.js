import { Event } from '../structures/Event.js';

// TODO: run an init command to schedule cron jobs through cron-node and cron.schedule
export default class Ready extends Event {
  constructor() {
    super();
    this.eventName = 'ready';
  }

  async execute(client) {
    client.logger.info('Bot started successfully.', { tags: ['Bot'] });

    client.on('error', (err) => client.logger.error(err, { tags: ['Bot'] }));
    process.on('unhandledRejection', (err) => client.logger.error(err, { tags: ['Process'] }));
    process.on('uncaughtException', (err) => client.logger.error(err, { tags: ['Process'] }));

    await client.commands.registerCommands();
  }
}
