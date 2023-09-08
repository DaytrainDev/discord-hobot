class CronJob {
  constructor() {
    this.cronJobName = '';
  }

  execute(client, ...args) {
    return { client, args };
  }
}

export { CronJob };
