// import { Category } from "@discordx/utilities"
// import { APIEmbed, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, ComponentType, JSONEncodable, StringSelectMenuInteraction } from "discord.js"
// import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "@decorators"
// import { ChessRunner, Database, DonjonRunner, Hobot } from "@services"
// import { resolveDependencies } from "@utils/functions"
// import { Campaign, CampaignRepository, CampaignSetting, CampaignSettingRepository, Character, CharacterRepository, Party, PartyRepository } from "@entities"
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

// @Discord()
// @Category('WIP')
// @SlashGroup({ description: "Game Commands", name: "game" })
// @SlashGroup({
//   description: "Start a game",
//   name: "start",
//   root: "game",
// })
// // end game
// // save game
// // load game
// export default class GameCommand {
// 	private readonly _categories: Map<string, CommandCategory[]> = new Map()
//     private db: Database
//     private fb: Hobot
//     private characterRepo: CharacterRepository
//     private partyRepo: PartyRepository
//     private campaignRepo: CampaignRepository
//     private campaignSettingRepo: CampaignSettingRepository

// 	constructor() {
//         resolveDependencies([Database, Hobot]).then(([db, fb]) => {
//             this.db = db
//             this.fb = fb
// 			this.characterRepo = this.db.get(Character)
// 			this.partyRepo = this.db.get(Party)
// 			this.campaignRepo = this.db.get(Campaign)
// 			this.campaignSettingRepo = this.db.get(CampaignSetting)
//         });
//     }

// 	@Slash({
// 		name: 'chess',
//         description: 'Start a game of chess.' // TODO: ' Embed dice rolls ex: [d20+9] or [4d6+4]'
// 	})
//     @SlashGroup("start", "game")
//     async roll(
//         @SlashOption({ name: 'difficulty', description: 'The level of difficulty.', type: ApplicationCommandOptionType.Number, required: false }) difficulty: number,
// 		interaction: CommandInteraction, 
//         client: Client,
//     ){	
//         const input = await interaction.deferReply();
//         const chessRunner = new ChessRunner(difficulty ?? 1);
        
//         chessRunner.getPlayerPieceOptions();

//         const collector = input.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 })

//         collector.on('collect', async (i: StringSelectMenuInteraction) => {
//             switch(i?.customId) {
//                 case 'game_chess_piece':
//                     await interaction.editReply({
//                         components: [
//                             {
//                                 type: 1,
//                                 components: [
//                                     {
//                                         "custom_id": `game_chess_piece`,
//                                         "options": chessRunner.getPlayerPieceOptions(i.values[0]),
//                                         "min_values": 1,
//                                         "max_values": 1,
//                                         "type": 3
//                                     },
//                                 ]
//                             },
//                             {
//                                 type: 1,
//                                 components: [
//                                     {
//                                         custom_id: `game_chess_move`,
//                                         options: chessRunner.getPieceMoveOptions(i.values[0]),
//                                         min_values: 1,
//                                         max_values: 1,
//                                         type: 3
//                                     }
//                                 ]
//                             },
//                         ]
//                     });
//                     break;
//                 case 'game_chess_move':
//                     chessRunner.movePiece(i.values[0])
//                     const cpuMove = chessRunner.getCpuMove();  
//                     if (!cpuMove) {
//                         await interaction.editReply(`You Win!\n${chessRunner?.drawBoard()}`);
//                         return;
//                     }
//                     chessRunner.movePiece(cpuMove)   
                    
//                     await interaction.editReply({
//                         content: `I move to ${cpuMove}. It's your turn.\n${chessRunner?.drawBoard()}`,
//                         components: [
//                             {
//                                 type: 1,
//                                 components: [
//                                     {
//                                         "custom_id": `game_chess_piece`,
//                                         "options": chessRunner.getPlayerPieceOptions(),
//                                         "min_values": 1,
//                                         "max_values": 1,
//                                         "type": 3
//                                     },
//                                 ]
//                             }
//                         ]
//                     });
//                     break;
//             }

//             collector.resetTimer();
//             await i.deferUpdate();
//         });


//         collector.on('end', async () => {
//             await interaction.editReply({content: `The game has ended due to inactivity.\n${chessRunner?.drawBoard()}`, components: []})
//             return;
//         });
        
//         await interaction.editReply({
//             content: `You start.\n${chessRunner?.drawBoard()}`,
//             // TODO: select piece, then possible move
//             components: [
//                 {
//                     type: 1,
//                     components: [
//                         {
//                             "custom_id": `game_chess_piece`,
//                             "options": chessRunner.getPlayerPieceOptions(),
//                             "min_values": 1,
//                             "max_values": 1,
//                             "type": 3
//                         },
//                     ]
//                 }
//             ]
//         });
//     }

// 	// @Slash({
// 	// 	name: 'donjon',
//     //     description: 'Start a donjon-generated 5e dungeon crawl.' // TODO: ' Embed dice rolls ex: [d20+9] or [4d6+4]'
// 	// })
//     // @SlashGroup("start", "game")
//     // async donjon(
//     //     @SlashOption({ name: 'dungeon_data', description: 'A json file generated at donjon.bin.sh/5e/dungeon', type: ApplicationCommandOptionType.Attachment, required: true }) dungeonData: any,
//     //     // @SlashOption({ name: 'character', description: 'Select a character', type: ApplicationCommandOptionType.String, required: true, autocomplete: true }) characterId: string,
// 	// 	interaction: CommandInteraction, // | AutocompleteInteraction, 
//     //     client: Client,
//     // ){	
// 	// 	// if (interaction.isAutocomplete()) {
// 	// 	// 	const focusedOption = interaction.options.getFocused(true);
// 	// 	// 	// TODO: search for partial name off focusedOption.value
// 	// 	// 	switch(focusedOption?.name) {
// 	// 	// 		case 'character':
// 	// 	// 			const characters = await this.characterRepo.findAll()
//     //     //             return interaction.respond(this.fb.autocompleteOptions(characters, 'characterId', 'name', focusedOption.value));
// 	// 	// 		default:
// 	// 	// 			return;
// 	// 	// 	}
// 	// 	// }
//     //     await interaction.deferReply({ephemeral: true});
//     //     // const character = await this.characterRepo.findOne({userId: interaction.user.id, characterId})
//     //     // if (!character) {
//     //     //     return;
//     //     // }
//     //     // if (!character?.data) {
//     //     //     character.data = {
//     //     //         classes: [],
//     //     //     }
//     //     // }
//     //     // if (character?.data?.classes?.length < 1) {
//     //     //     character.data.classes.push({
//     //     //         index: 'fighter',
//     //     //         level: 1,
//     //     //     })
//     //     // }

//     //     const donjonRunner = new DonjonRunner(dungeonData, {
//     //         data: {
//     //             classes: [
//     //                 {
//     //                     index: 'fighter',
//     //                     name: "Fighter",
//     //                     level: 1,
//     //                 }
//     //             ],
//     //             xp: 0,
//     //         },
//     //         name: 'Player',
//     //     });
        
//     //     return interaction.editReply(`TEST DONJON`);
//     // }

// }