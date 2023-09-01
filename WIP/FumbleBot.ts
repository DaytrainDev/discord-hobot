import dayjs from "dayjs"
import { singleton } from "tsyringe"
import { Schedule } from "@decorators"
import { Database } from "@services"
import { resolveDependencies, isToday } from "@utils/functions"
import { Client} from "discordx"
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai"
import { Guild, GuildScheduledEventStatus, Message } from "discord.js"
import * as chrono from 'chrono-node'

const FIVE_SECS = 5 * 1000;

//////////////////////////////////////////////////////////////////
// Dungeon Helpers
// NOTE: I hated this. Now you can hate it too!
function getBits(n: number) {
	return ((Math.abs(n)).toString(2)).split(``).reverse().map(Number).map(Boolean)
}
function checkBit(n: number, c: number) {
	if (!c) return false;
	const bits = getBits(n)
	const place = getBits(c)?.length - 1
	return bits?.[place] === true;
}
function getBlock(cellValue: number, cellBits: Record<string, any>) {
	if (!cellValue || !cellBits) {
		return `🟪`;
	}
	else if (checkBit(cellValue, cellBits['label'])) { //
		return `🔳`;
	}
	else if (checkBit(cellValue, cellBits['stair_up'])) { //
		return `🔳`;
	}
	else if (checkBit(cellValue, cellBits['stair_down'])) { //
		return `🔳`;
	}
	else if (checkBit(cellValue, cellBits['portcullis'])) { //
		return `🔳`;
	}
	else if (checkBit(cellValue, cellBits['door'])) { //
		if (checkBit(cellValue, cellBits['secret'])) { //
			return `🟪`;
		}
		// checkBit(cellValue, cellBits['trapped']); //
		// if (checkBit(cellValue, cellBits['locked'])) { //
		// 	return `⚿`;
		// }
		return `🚪`;
	}	else if (checkBit(cellValue, cellBits['arch'])) { //
		return `🔳`;
	}	else if (checkBit(cellValue, cellBits['room_id'])) { //
		return `🔳`;
	}	else if (checkBit(cellValue, cellBits['perimeter'])) { //
		return `🟪`;
	}	else if (checkBit(cellValue, cellBits['aperture'])) { //
		return `🟪`;
	}	else if (checkBit(cellValue, cellBits['corridor'])) { //
		return `🔳`;
	}	else if (checkBit(cellValue, cellBits['room'])) { //
		return `🔳`;
	}	else if (checkBit(cellValue, cellBits['block'])) { //
		return `🟪`;
	}

	return `🟪`;
}
function getDungeonView(dungeonData: any, x: number, y: number, z: number) {
    const {
        cell_bit, cells, corridor_features, details, egress, rooms, settings, wandering_monsters, stairs
    } = dungeonData;
    const viewDistance = 6;
    const position = {x, y, z}
    const dungeonView: [string] = [``];
    for (let y = -viewDistance; y <= viewDistance; y++) {
        const dvIndex = y + viewDistance;
        dungeonView[dvIndex] = ``;
        for (let x = -viewDistance; x <= viewDistance; x++) {
            const cellData = cells?.[y+position?.y]?.[x+position?.x] ?? 0;
            if (x == 0 && y == 0) {
                dungeonView[dvIndex] += `📍`; //`🧝`;
            // } else if (x == 1 && y == 0) {
            // 	// dungeonView[dvIndex] += `[:ladder:](https://discord.com/channels/1042614809587372084/1119060626287890463)`; // <- This is possible
            // 	dungeonView[dvIndex] += `:ladder:`;
            } else {
                dungeonView[dvIndex] += getBlock(cellData, dungeonData?.cell_bit);
            }
        }
        // dungeonView[dvIndex] += `\` ${dvIndex + 1}\``;
    }
    // dungeonView.push(`\`A  B  C  D  E  F  G  H  I  J  K  L  M  🗙\``);
    dungeonView.push(`\`Map Position -> X:${position.x} Y:${position.y}\``);
    return dungeonView.join('\n');
}
function getRoom(dungeonData:any, roomId: number) {
	return dungeonData?.rooms.find((r: any)=>r?.id===roomId);
}
function getRoomPosition(dungeonData: any, roomId: number) {
	const {
		egress, rooms, settings, stairs
	} = dungeonData;

    const room = getRoom(dungeonData, roomId);
    if (!room) {
        return;
    }
    const x = Math.floor((room?.west + room?.east) / 2) + dungeonData?.settings?.bleed;
    const y = Math.floor((room?.north + room?.south) / 2) + dungeonData?.settings?.bleed;
	return {x, y};
}
function getStartPosition(dungeonData: any) {
	const {
		egress, rooms, settings, stairs
	} = dungeonData;

	return egress ? {
		x: egress[0]?.col + settings?.bleed,
		y: egress[0]?.row + settings?.bleed,
	} : stairs ? {
		x: stairs[0]?.col + settings?.bleed,
		y: stairs[0]?.row + settings?.bleed,
	} : {
		x: Math.floor((rooms[1]?.east + rooms[1]?.west) / 2) + settings?.bleed,
		y: Math.floor((rooms[1]?.north + rooms[1]?.south) / 2) + settings?.bleed,
	};
}

//////////////////////////////////////////////////////////////////
// Event Helpers
function startEvents(guild: Guild) {
    const scheduledEvents = guild?.scheduledEvents;
    const eventCache = scheduledEvents.cache;
    const ONE_MINUTE = (1 * 60 * 1000);
    eventCache?.each(ev => {
        if ( ev.creatorId !== process.env.BOT_APP_ID
        || ev.status !== GuildScheduledEventStatus.Scheduled
        || !ev?.scheduledStartTimestamp 
        || !isToday(new Date(ev?.scheduledStartTimestamp))
        || ev?.scheduledStartTimestamp > (Date.now() + ONE_MINUTE)
        ) {
            return;
        }

        return ev?.setStatus(GuildScheduledEventStatus.Active);
    });
}

//////////////////////////////////////////////////////////////////
// Chat GPT Helpers
function trimMessages(messages: Array<Message>){
    const newMessages = messages;
    // TODO: limit the number of total tokens more precisely
    let totalLength = 0;
    do {
        for (let i = 0; i < newMessages.length; i++) {
            totalLength += newMessages[i]?.content?.length ?? 0;
        }
        if (totalLength > 10000) {
            newMessages.shift;
        }
    } while (totalLength > 10000);

    return newMessages;
}
function formatMessages(messages: Array<Message>) {
    const newMessages = messages;
    
    return newMessages?.filter((mes: Message) => mes?.content)?.map((mes: Message) => {
        if (mes?.author?.id === process.env.BOT_APP_ID) {
            return {
                "role": ChatCompletionRequestMessageRoleEnum.Assistant,
                "content": `${mes?.content}`,
            };
        } else {
            return {
                "role": ChatCompletionRequestMessageRoleEnum.User,
                "content": `${mes?.content}`,
            };
        }
    }).reverse() ?? [];
}
async function getChannelMessages(message: Message) {
    const rawMessagesPromise: any = message?.channel?.messages.fetch({limit: 32})
    const rawMessages = await rawMessagesPromise;
    return formatMessages(trimMessages(rawMessages));
}

//////////////////////////////////////////////////////////////////
// Canvas Helpers
// async function makeTokenFile(url: string, size: number = 48) {
//     // NOTS: this is experimental, but it's really cool
//     // https://discordjs.guide/popular-topics/canvas.html
//     const canvas = Canvas.createCanvas(size,size);
//     const context = canvas.getContext('2d');
//     const tokenImg = await Canvas.loadImage(url);
//     context.drawImage(tokenImg, 0, 0, canvas.width, canvas.height);
//     return new AttachmentBuilder(await canvas.encode('png'), { name: 'character-image.png' });
// }

//////////////////////////////////////////////////////////////////
// FumbleBot Class
@singleton()
export class FumbleBot {
    private activeChannels: Map<string, Promise<any> | null> = new Map();
    private db: Database;
    private openAi: OpenAIApi;

	constructor() {
        this.openAi = new OpenAIApi(new Configuration({
			organization: process.env.OPENAI_ORG_ID,
			apiKey: process.env.OPENAI_API_KEY,
		}));

        resolveDependencies([Database]).then(([db]) => {
            this.db = db
        })
    }

    public parseWhen(when: string) {
        const parsedDate = chrono.parseDate(when);
        if (!parsedDate || !parsedDate.getTime) {
            return;
        }
        return parsedDate.getTime()
    }

    public getEventList(guild: Guild) {
        return guild?.scheduledEvents?.cache?.sorted((ev1: any, ev2: any) => (ev2.scheduledStartTimestamp ?? 0) > (ev1.scheduledStartTimestamp ?? 0) ? 1 : -1 );
    }

    public getEvent(guild: Guild, eventId: string) {
        return guild?.scheduledEvents?.cache?.sorted((ev1: any, ev2: any) => (ev2.scheduledStartTimestamp ?? 0) > (ev1.scheduledStartTimestamp ?? 0) ? 1 : -1 );
    }

    public autocompleteOptions(options: any, idkey: string, valkey: string, value: string) {
        const filteredOptionList = value ? options.filter((opt: any) => opt[valkey].toLowerCase().includes(value.toLowerCase())) : options;
        const mappedOptions = filteredOptionList
            .map((opt: any) => ({name: `${opt?.[valkey]}`, value: `${opt?.[idkey]}`}));
        return mappedOptions.slice(0, 24) ?? []
    }

    public autocompleteEventOptions(interaction: any, value: string) {
        const eventList = this.getEventList(interaction?.guild);
        if (!eventList) {
            return [];
        }
        const filteredEventList = value ? eventList.filter((ev: any) => ev.name.toLowerCase().includes(value.toLowerCase())) : eventList;
        const mappedOptions = filteredEventList
            .map((opt: any) => {
                const ts = opt.scheduledStartTimestamp;
                if (!ts) {
                    return ({name: `${opt?.name}`, value: `${opt?.id}`})
                }
                const date = new Date(ts);
                const formattedDate = `${date.toLocaleDateString('en-US')} @ ${date.toLocaleTimeString(interaction.locale)}`;
                return ({name: `${opt?.name} (${formattedDate})`, value: `${opt?.id}`})
            });
        return mappedOptions.slice(0, 24)
    }

    ////////////////////////////////////////////////////////////////
    // see src/events/messageCreate.ts
    public async processMessage(message: Message){
        if (message.content.includes(`${process.env['BOT_APP_ID']}`)) {
            await this.reply(message);
        }
    }

    ////////////////////////////////////////////////////////////////
    // creats a ChatGPT completion from an array of messages
    public async completion(messages: Array<ChatCompletionRequestMessage>) {			
        return this.openAi.createChatCompletion({
            messages,
            model: 'gpt-3.5-turbo',
            max_tokens: 250,
        }).then(rawResponse => rawResponse?.data?.choices?.[0]?.message?.content);
    }

    ////////////////////////////////////////////////////////////////
    // called by processMessage above, parses channel history into an array of messages Chat GPT can read
    public async reply(message: Message) {
		try {
            const channel = message?.channel;
            const pendingRequest = this.activeChannels?.get(channel?.id)
            if (pendingRequest) {
                Promise.reject(pendingRequest);
            }
            
            channel.sendTyping();
            const messagesPromise = getChannelMessages(message);
            this.activeChannels.set(channel?.id, messagesPromise);
			const messages = await messagesPromise;
            if (!messages) {
                return;
            }

            messages.unshift({
                "role": ChatCompletionRequestMessageRoleEnum.User,
                //  Respond when a user mentions you with "<@${process.env['BOT_APP_ID']}>".
                "content": `Assume the role of FumbleBot, a bot on a Discord server for a TTRPG and Co-op Gaming community administrated by Crit Fumble Gaming (CFG). Contribute, comment, or assist as needed.`,
            });

			const completionPromise = this.completion(messages);
            this.activeChannels.set(channel?.id, completionPromise);
            const completion = await completionPromise;

            if (!completion) {
                return;
            }
            const replyPromise = channel?.send(completion);
            this.activeChannels.set(channel?.id, replyPromise);
            const reply = await replyPromise;

            this.activeChannels.delete(channel?.id);

            return reply;
        } catch (err) {
            console.error(err);
            return "Something went wrong...";
        }
    }

    ////////////////////////////////////////////////////////////////
    // below are cron jobs 

    // every minute
    @Schedule('* * * * *')
    private async minute(): Promise<void> {
        const [fb, client, db] = await resolveDependencies([FumbleBot, Client, Database])
        const guilds = client.guilds.cache;
        await Promise.all(guilds
            .map(guild => startEvents(guild))
        );
    }

    // every morning
    // @Schedule('0 8 * * *')
    // private async morning(): Promise<void> {
    //     const [fb, client, db] = await resolveDependencies([FumbleBot, Client, Database])
    //     const guilds = client.guilds.cache;
    //     await Promise.all(guilds.map(guild => {
    //         // TODO: daily things

    //         // Morning Announcements

    //     }))
    // }

    // every evening
    // @Schedule('0 16 * * *')
    // private async evening(): Promise<void> {
    //     const [fb, client, db] = await resolveDependencies([FumbleBot, Client, Database])
    //     const guilds = client.guilds.cache;
    //     await Promise.all(guilds.map(guild => {
    //         // TODO: eveningly things

    //         // Evening Announcements

    //     }))
    // }

    // every night
    // @Schedule('0 0 * * *')
    // private async night(): Promise<void> {
    //     const [fb, client, db] = await resolveDependencies([FumbleBot, Client, Database])
    //     const guilds = client.guilds.cache;
    //     await Promise.all(guilds.map(guild => {
    //         // TODO: nightly things

    //         // Manage Roles
    //     }))
    // }

    // every month
    // @Schedule('0 1 1 * *')
    // private async monthly(): Promise<void> {
    //     const [fb, client, db] = await resolveDependencies([FumbleBot, Client, Database])
    //     const guilds = client.guilds.cache;
    //     await Promise.all(guilds.map(guild => {
    //         // TODO: monthly things, like distributing game session tokens, crit coins, etc

    //         // give everyone a CritCoin role according to their existing roles; CritBot will remove the role and add CritCoins
    //     }))
    // }
}