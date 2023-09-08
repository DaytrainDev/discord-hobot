import { Event } from '../structures/Event.js';

export default class VoiceStateUpdate extends Event {
  constructor() {
    super();
    this.eventName = 'voiceStateUpdate';
  }

  execute(client, oldState, newState) {
    // guild: <Guild Object>.
    // id: '451207409915002882',
    // serverDeaf: false,
    // serverMute: false,
    // selfDeaf: false,
    // selfMute: false,
    // selfVideo: false,
    // sessionId: '4f83fbb65deb545707e53c098eefcd5a',
    // streaming: false,
    // channelId: null,
    // suppress: false,
    // requestToSpeakTimestamp: null

    if (oldState.channelId !== newState.channelId) {
      // user joined or changed channels

      // if event starts in the last 30 min, start now

      // is event starting within 30 minutes? if so, scheduled event start
    }
  }
}
