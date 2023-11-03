import {
  Client as DiscordClient, GatewayIntentBits, Partials, ActivityType,
} from 'discord.js';
import { EventManager } from './managers/EventManager.js';
import { CommandManager } from './managers/CommandManager.js';
import { DatabaseManager } from './managers/DatabaseManager.js';
import { CronJobManager } from './managers/CronJobManager.js';
import { createWinstonLogger } from './utils/Logger.js';
import { ApiManager } from './managers/ApiManager.js';

export class Client extends DiscordClient {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.Channel, Partials.User, Partials.GuildMember, Partials.Message, Partials.GuildScheduledEvent],
      failIfNotExists: false,
      allowedMentions: {
        parse: ['users'],
        repliedUser: false,
      },
      presence: {
        status: process.env.NODE_ENV === 'development' ? 'idle' : 'online',
        activities: [{
          name: '/help', type: ActivityType.Playing,
        }],
      },
    });

    this.database = new DatabaseManager(this);
    this.commands = new CommandManager(this);
    this.events = new EventManager(this);
    this.cronJobs = new CronJobManager(this);
    this.api = new ApiManager(this).start();
  }

  async start() {
    this.logger = createWinstonLogger(
      {
        handleExceptions: true,
        handleRejections: true,
      },
      this,
    );
    await this.commands.loadCommands(this);
    await this.events.loadEvents();
    await this.cronJobs.loadCronJobs();

    await super.login(process.env.BOT_TOKEN);
  }
}
