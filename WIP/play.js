// import { Category } from "@discordx/utilities"
// import { ApplicationCommandOptionType, Attachment, AttachmentBuilder, AutocompleteInteraction, CommandInteraction, ComponentType, WebhookClient } from "discord.js"
// import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "@decorators"
// import { Database, FumbleBot } from "@services"
// import { resolveDependencies } from "@utils/functions"
// import { Campaign, CampaignRepository, CampaignSetting, CampaignSettingRepository, Character, CharacterRepository, Party, PartyRepository } from "@entities"
// import Canvas from '@napi-rs/canvas';
// import { DiceRoll, DiceRoller } from '@dice-roller/rpg-dice-roller'
// import { v4 as uuidv4 } from 'uuid';
// import { Client } from "discordx"

// // async function makeTokenFile(url: string, size: number = 48) {
// //     // NOTS: this is experimental, but it's really cool
// //     // https://discordjs.guide/popular-topics/canvas.html
// //     const canvas = Canvas.createCanvas(size,size);
// //     const context = canvas.getContext('2d');
// //     const tokenImg = await Canvas.loadImage(url);
// //     context.drawImage(tokenImg, 0, 0, canvas.width, canvas.height);
// //     return new AttachmentBuilder(await canvas.encode('png'), { name: 'character-image.png' });
// // }

// const DEFAULT_TOKEN =  'https://www.worldanvil.com/uploads/images/0698a091e4f1360c364f76c24046d69f.png';

// export const makeCharacterWebhook = async (interaction: CommandInteraction, characterRepo: CharacterRepository) =>  {
//     const isThread = interaction?.channel?.isThread();
//     let characterData = isThread 
//         ? await characterRepo.findOne({userId: interaction.user?.id, gameChannelId: interaction?.channel.parentId}) 
//         : await characterRepo.findOne({userId: interaction.user?.id, gameChannelId: interaction?.channelId});
//     const webhook =  await interaction.guild?.channels.createWebhook({
//         name: `{$characterData?.name}`,
//         avatar: characterData?.token?.url ?? DEFAULT_TOKEN,
//         channel: interaction?.channelId,
//     })

//     return webhook;
// }

// export const filteredOptions = (options: any, idkey: string, valkey: string, value: string) => {
//     const filteredOptionList = value ? options.filter((opt: any) => opt[valkey].toLowerCase().includes(value.toLowerCase())) : options;
//     const mappedOptions = filteredOptionList
//         .map((opt: any) => ({name: `${opt?.name}`, value: `${opt?.[idkey]}`}));
//     return mappedOptions.slice(0, 24) ?? []
// }

// @Discord()
// @Category('Player')
// @SlashGroup({ description: "Player Commands", name: "play" })
// @SlashGroup({
//   description: "Character Options",
//   name: "character",
//   root: "play",
// })
// // @SlashGroup({
// //   description: "Settings for Channel",
// //   name: "options",
// //   root: "play",
// // })
// export default class PlayCommand {
// 	private readonly _categories: Map<string, CommandCategory[]> = new Map()
//     private db: Database
//     private fb: FumbleBot
//     private characterRepo: CharacterRepository
//     private partyRepo: PartyRepository
//     private campaignRepo: CampaignRepository
//     private campaignSettingRepo: CampaignSettingRepository

// 	constructor() {
//         resolveDependencies([Database, FumbleBot]).then(([db, fb]) => {
//             this.db = db
//             this.fb = fb
// 			this.characterRepo = this.db.get(Character)
// 			this.partyRepo = this.db.get(Party)
// 			this.campaignRepo = this.db.get(Campaign)
// 			this.campaignSettingRepo = this.db.get(CampaignSetting)
//         });
//     }

// 	@Slash({
// 		name: 'roll',
//         description: 'Make a dice roll.' // TODO: ' Embed dice rolls ex: [d20+9] or [4d6+4]'
// 	})
//     @SlashGroup("play")
//     async roll(
//         @SlashOption({ name: 'roll_string', description: 'Dice roll string, ex: `2d20kh1+5`.', type: ApplicationCommandOptionType.String, required: false }) roll: string,
//         @SlashOption({ name: 'action', description: 'In-character action, ex: `1st Attack`.', type: ApplicationCommandOptionType.String, required: false }) action: string,
// 		interaction: CommandInteraction, 
//         client: Client,
//     ){	
//         await interaction.deferReply({ephemeral: true});
//         const webhook = await makeCharacterWebhook(interaction, this.characterRepo);
//         if (!webhook) {
//             return
//         }
//         const result = new DiceRoll(roll)
//         if (!result) {
//             return interaction.editReply(`${roll} is not a valid roll string. See https://dice-roller.github.io/documentation/guide/notation/dice.html`);
//         }
//         await webhook.send(`\`${result}\`\n${action ? `${action}: ` : ``}**${result.total}**`);
//         await webhook.delete();
//         return interaction.deleteReply();
//     }

// 	@Slash({
// 		name: 'say',
//         description: 'Say something in character.' // TODO: ' Embed dice rolls ex: [d20+9] or [4d6+4]'
// 	})
//     @SlashGroup("play")
//     async say(
//         @SlashOption({ name: 'quote', description: 'In-character quote.', type: ApplicationCommandOptionType.String, required: true }) quote: string,
// 		interaction: CommandInteraction, 
//         client: Client,
//     ){	
//         await interaction.deferReply({ephemeral: true});
//         const webhook = await makeCharacterWebhook(interaction, this.characterRepo);
//         if (!webhook) {
//             return
//         }
//         await webhook.send(`${quote}`);
//         await webhook.delete();
//         return interaction.deleteReply()
//     }

// 	@Slash({
// 		name: 'move',
//         description: 'Move your character with directional buttons.' // TODO: ' Embed dice rolls ex: [d20+9] or [4d6+4]'
// 	})
//     @SlashGroup("play")
//     async move(
//         @SlashOption({ name: 'description', description: 'Describe your movement.', type: ApplicationCommandOptionType.String, required: false }) desc: string,
// 		interaction: CommandInteraction, 
//         client: Client,
//     ){	
//         await interaction.deferReply({ephemeral: true});
//         const emojis ={
//             play_move_upper_left: `↖️`, 
//             play_move_up: `⬆️`, 
//             play_move_upper_right: `↗️`,
//             play_move_left: `⬅️`,
//             play_move_stop: `🛑`,
//             play_move_right: `➡️`,
//             play_move_lower_left: `↙️`,
//             play_move_down: `⬇️`,
//             play_move_lower_right: `↘️`,
//         } as Record<string, any>;

//         const controlPad = [
//             {
//                 type: 1,
//                 components: Object.keys(emojis).slice(0,3).map((key) => ({
//                     style: 1,
//                     label: emojis[key],
//                     custom_id: key,
//                     disabled: false,
//                     type: 2
//                 })),
//             },
//             {
//                 type: 1,
//                 components: Object.keys(emojis).slice(3,6).map((key) => ({
//                     style: 1,
//                     label: emojis[key],
//                     custom_id: key,
//                     disabled: false,
//                     type: 2
//                 })),
//             },
//             {
//                 type: 1,
//                 components: Object.keys(emojis).slice(6,9).map((key) => ({
//                     style: 1,
//                     label: emojis[key],
//                     custom_id: key,
//                     disabled: false,
//                     type: 2
//                 })),
//             },
//         ];

//         let input = await interaction.editReply({
//             content: 'Input your movement using the directional buttons below.',
//             components: controlPad,
//         })

//         let content = ``;
//         const collector = input.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 })

//         collector.on('collect', async (i) => {
//             if (i.customId !== 'play_move_stop') {
//                 content += `${emojis[i.customId]}`
//                 await interaction.editReply(`\`Movement: ${content}\``);
//                 collector.resetTimer();
//             } else {
//                 await interaction.editReply({content: `One moment...`, components: []});
//                 collector.stop();
//             }
//             await i.deferUpdate()
//         });

//         collector.on('end', async () => {
//             if (!content) {
//                 await interaction.editReply({content: `No movement entered.`, components: []})
//                 return;
//             }
//             const webhook = await makeCharacterWebhook(interaction, this.characterRepo);
//             // TODO: parse from collected, 1st arg in this function
//             content = `\`Movement: ${content}\`\n${desc}`;
//             if (!webhook) {
//                 await interaction.editReply({content, components: []})
//                 return;
//             }
//             await webhook.send(content);
//             await webhook.delete();
//             await interaction.deleteReply();
//             return;
//         });
//     }

// 	@Slash({
// 		name: 'endturn',
//         description: 'End your turn.' // TODO: ' Embed dice rolls ex: [d20+9] or [4d6+4]'
// 	})
//     @SlashGroup("play")
//     async endturn(
// 		interaction: CommandInteraction, 
//         client: Client,
//     ){	
//         await interaction.deferReply({ephemeral: true});
//         const webhook = await makeCharacterWebhook(interaction, this.characterRepo);
//         if (!webhook) {
//             return
//         }
//         // TODO: ping next in turn order
//         await webhook.send(`\`End Turn\``);
//         await webhook.delete();
//         return interaction.deleteReply()
//     }

//     ////////////////////////////////////////////
//     // 
//     // Session Commands
//     // 

//     ////////////////////////////////////////////
//     // 
//     // Option Commands
//     // 
// }