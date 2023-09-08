import cron from 'node-cron';
import { readdir } from 'node:fs/promises';

export class CronJobManager {
  constructor(client) {
    this.client = client;
  }

  async loadCronJobs() {
    const cronFiles = (await readdir('./cronJobs/')).filter(file => file.endsWith('.js'));
    for await (const cronFile of cronFiles) {
      const { default: CronJobClass } = await import(`../cronJobs/${cronFile}`);
      const cronInstance = new CronJobClass();
      await cron.schedule(cronInstance.schedule, () => cronInstance.execute(this.client));
    }

    this.client.logger.info(`Loaded ${cronFiles.length} cron jobs successfully!`, { tags: ['Cron Jobs'] });
  }
}
