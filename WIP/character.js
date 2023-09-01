// import { Category } from "@discordx/utilities"
// import { ApplicationCommandOptionType, Attachment, AutocompleteInteraction, CommandInteraction, } from "discord.js"
// import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "@decorators"
// import { Database, FumbleBot } from "@services"
// import { resolveDependencies } from "@utils/functions"
// import { Campaign, CampaignRepository, CampaignSetting, CampaignSettingRepository, Character, CharacterRepository, Party, PartyRepository } from "@entities"
// import { DiceRoll, DiceRoller } from '@dice-roller/rpg-dice-roller'
// import { v4 as uuidv4 } from 'uuid';


// @Discord()
// @Category('Player')
// @SlashGroup({ description: "Character Options", name: "character" })
// // @SlashGroup({
// //   description: "Settings for Channel",
// //   name: "options",
// //   root: "play",
// // })
// export default class CharacterCommand {
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

// 	// Manage Commands
// 	@Slash({ 
// 		name: 'select',
// 		description: 'Select a character.'
// 	})
// 	@SlashGroup("character")
// 	async selectc(
// 		@SlashOption({ 
// 			autocomplete: true,
// 			name: 'character', 
// 			type: ApplicationCommandOptionType.String, 
// 			required: true 
// 		}) characterId: string,
// 		interaction: CommandInteraction | AutocompleteInteraction, 
// 	) {
// 		if (interaction.isAutocomplete()) {
// 			const focusedOption = interaction.options.getFocused(true);
// 			// TODO: search for partial name off focusedOption.value
// 			switch(focusedOption?.name) {
// 				case 'character':
// 					const options = await this.characterRepo.find({ userId: interaction.user?.id })
//                     return this.fb.autocompleteOptions(options, 'characterId', 'name', focusedOption?.value);
// 				default:
// 					return;
// 			}
// 			// }
// 		}

// 		await interaction.deferReply({ephemeral: true});
// 		// remove existing characters from this channel
// 		const existing = await this.characterRepo.find({ userId: interaction.user.id, gameChannelId: interaction.channelId });
// 		await Promise.all(existing.map(ex =>  this.characterRepo.upsert({ 
// 			userId: interaction.user.id,
// 			characterId: ex?.characterId,
// 			gameChannelId: null,
// 			gameThreadId: null,
// 			gameMessageId: null,
// 		})));
// 		const characterData = await this.characterRepo.findOne({ characterId });
// 		// add character to this channel
// 		if (interaction.channel?.isThread()) {
// 			const gameMessageId = (await interaction.channel.fetchStarterMessage())?.id;
// 			await this.characterRepo.upsert({ 
// 				userId: interaction.user.id,
// 				characterId: characterData?.characterId,
// 				gameChannelId: interaction.channel.parentId,
// 				gameThreadId:  interaction.channelId,
// 				gameMessageId,
// 			});
// 		} else {
// 			await this.characterRepo.upsert({ 
// 				userId: interaction.user.id,
// 				characterId: characterData?.characterId,
// 				gameChannelId: interaction.channelId,
// 				gameThreadId: null,
// 				gameMessageId: null,
// 			});
// 		}
// 		this.characterRepo.flush();

// 		await interaction.editReply({
// 			content: `Character Moved to this Channel -> ${JSON.stringify(characterData, null, 2)}`,
// 		})
// 	}

// 	@Slash({ 
// 		name: 'new',
// 		description: 'create a new character'
// 	})
// 	@SlashGroup("character")
// 	async newc(
// 		@SlashOption({ name: 'name', type: ApplicationCommandOptionType.String, required: true }) name: string,
// 		// @SlashOption({ name: 'pronouns', type: ApplicationCommandOptionType.String, required: false }) pronouns: string,
// 		@SlashOption({ name: 'description', type: ApplicationCommandOptionType.String, required: false }) description: string,
// 		@SlashOption({ name: 'token', type: ApplicationCommandOptionType.Attachment , required: false }) token: Attachment,
// 		// @SlashOption({ name: 'portrait', type: ApplicationCommandOptionType.Attachment , required: false }) portrait: Attachment,
// 		// @SlashOption({ name: 'sheet', type: ApplicationCommandOptionType.Attachment , required: false }) sheet: Attachment,
// 		@SlashOption({ name: 'party', type: ApplicationCommandOptionType.String, required: false, autocomplete: true }) partyId: string,
// 		@SlashOption({ name: 'campaign', type: ApplicationCommandOptionType.String, required: false, autocomplete: true }) campaignId: string,
// 		interaction: CommandInteraction | AutocompleteInteraction, 
// 	) {
// 		if (interaction.isAutocomplete()) {
// 			const focusedOption = interaction.options.getFocused(true);
// 			switch(focusedOption?.name) {
// 				case 'campaign':
// 					const campaigns = await this.campaignRepo.findAll();
//                     return interaction.respond(this.fb.autocompleteOptions(campaigns, 'campaignId', 'name', focusedOption.value));
// 				case 'party':
// 					const parties = await this.campaignRepo.findAll();
//                     return interaction.respond(this.fb.autocompleteOptions(parties, 'partyId', 'name', focusedOption.value));
// 				default:
// 					return;
// 			}
// 		}

// 		await interaction.deferReply({ephemeral: true});
// 		let character = await this.characterRepo.findOne({userId: interaction.user?.id, name});
        
// 		if (!character) {
// 			let party = await this.partyRepo.findOne({partyId});
// 			character = await this.characterRepo.create({ 
// 				userId: interaction.user.id,
// 				characterId: uuidv4(),
// 				createdAt: new Date(),
// 				updatedAt: new Date(),
// 				lastInteract: new Date(),
// 				name,
// 				token,
// 				partyId: partyId,
// 				campaignId: campaignId ?? party?.campaignId,
// 			});
// 			await this.characterRepo.flush();
// 			await interaction.editReply({
// 				content: `Character Created -> ${JSON.stringify(character, null, 2)}`,
// 			})
// 		} else {
// 			await interaction.editReply({
// 				content: `Character Already Exists -> ${JSON.stringify(character, null, 2)}`,
// 			})
// 		}
// 	}

// 	@Slash({ 
// 		name: 'edit',
// 		description: 'Edit a character.'
// 	})
// 	@SlashGroup("character")
// 	async editc(
// 		@SlashOption({ 
// 			autocomplete: true,
// 			name: 'character', 
// 			type: ApplicationCommandOptionType.String, 
// 			required: true 
// 		}) characterId: string,
// 		@SlashOption({ name: 'name', type: ApplicationCommandOptionType.String, required: false }) name: string,
// 		// @SlashOption({ name: 'pronouns', type: ApplicationCommandOptionType.String, required: false }) pronouns: string,
// 		// @SlashOption({ name: 'description', type: ApplicationCommandOptionType.String, required: false }) description: string,
// 		@SlashOption({ name: 'token', type: ApplicationCommandOptionType.Attachment , required: false }) token: Attachment,
// 		// @SlashOption({ name: 'portrait', type: ApplicationCommandOptionType.Attachment , required: false }) portrait: Attachment,
// 		// @SlashOption({ name: 'sheet', type: ApplicationCommandOptionType.Attachment , required: false }) sheet: Attachment,
// 		@SlashOption({ name: 'party', type: ApplicationCommandOptionType.String, required: false, autocomplete: true }) partyId: string,
// 		@SlashOption({ name: 'campaign', type: ApplicationCommandOptionType.String, required: false, autocomplete: true }) campaignId: string,
// 		interaction: CommandInteraction | AutocompleteInteraction, 
// 	) {
// 		if (interaction.isAutocomplete()) {
// 			const focusedOption = interaction.options.getFocused(true);
// 			// TODO: search for partial name off focusedOption.value
// 			switch(focusedOption?.name) {
// 				case 'character':
// 					const characters = await this.characterRepo.findAll()
//                     return interaction.respond(this.fb.autocompleteOptions(characters, 'characterId', 'name', focusedOption.value));
// 				case 'campaign':
// 					const campaigns = await this.campaignRepo.findAll();
// 					return interaction.respond(this.fb.autocompleteOptions(campaigns, 'campaignId', 'name', focusedOption.value));
// 				case 'party':
// 					const parties = await this.campaignRepo.findAll();
// 					return interaction.respond(this.fb.autocompleteOptions(parties, 'partyId', 'name', focusedOption.value));
// 				default:
// 					return;
// 			}
// 		}

// 		// TODO: create a character with params in DB
// 		await interaction.deferReply({ephemeral: true});
// 		let character = await this.characterRepo.findOne({userId: interaction.user?.id, characterId});
// 		if (character) {
// 			let party = await this.partyRepo.findOne({partyId: partyId ?? character.partyId});
// 			character = await this.characterRepo.upsert(
// 				{
// 					userId: interaction.user.id,
// 					characterId: character?.characterId,
// 					updatedAt: new Date(),
// 					lastInteract: new Date(),
// 					name,
// 					token,
// 					partyId: partyId,
// 					campaignId: campaignId ?? party?.campaignId,
// 				}
// 			)
// 			await this.characterRepo.flush();
// 			await interaction.editReply({
// 				content: `Character "${character?.name}" -> ${JSON.stringify(character, null, 2)}`,
// 			})
// 		} else {
// 			await interaction.editReply({
// 				content: `Character "${characterId}" Not Found`,
// 			})
// 		}
// 	}

// 	@Slash({ 
// 		name: 'view',
// 		description: 'View a character\'s data.'
// 	})
// 	@SlashGroup("character")
// 	async viewc(
// 		@SlashOption({ 
// 			autocomplete: true,
// 			name: 'character', 
// 			type: ApplicationCommandOptionType.String, 
// 			required: true 
// 		}) characterId: string,
// 		interaction: CommandInteraction | AutocompleteInteraction, 
// 	) {
// 		if (interaction.isAutocomplete()) {
// 			const focusedOption = interaction.options.getFocused(true);
// 			switch(focusedOption?.name) {
// 				case 'character':
// 					const characters = await this.characterRepo.findAll()
//                     return interaction.respond(this.fb.autocompleteOptions(characters, 'characterId', 'name', focusedOption.value));
// 				default:
// 					return;
// 			}
// 			// }
// 		}

// 		await interaction.deferReply({ephemeral: true});
// 		const characterData = await this.characterRepo.findOne({userId: interaction.user?.id, characterId});
// 		if (characterData) {
// 			await interaction.editReply({
// 				content: `Character "${characterData?.name}" -> ${JSON.stringify(characterData, null, 2)}`,
// 			})
// 		} else {
// 			await interaction.editReply({
// 				content: `Character "${characterId}" Not Found`,
// 			})
// 		}
// 	}

// 	@Slash({ 
// 		name: 'remove',
// 		description: 'remove a character'
// 	})
// 	@SlashGroup("character")
// 	async remove(
// 		@SlashOption({ 
// 			autocomplete: true,
// 			name: 'character', 
// 			type: ApplicationCommandOptionType.String, 
// 			required: true 
// 		}) characterId: string,
// 		interaction: CommandInteraction | AutocompleteInteraction, 
// 	) {
// 		if (interaction.isAutocomplete()) {
// 			const focusedOption = interaction.options.getFocused(true);
// 			switch(focusedOption?.name) {
// 				case 'character':
// 					const characters = await this.characterRepo.findAll()
//                     return interaction.respond(this.fb.autocompleteOptions(characters, 'characterId', 'name', focusedOption.value));
// 				default:
// 					return;
// 			}
// 			// }
// 		}

// 		await interaction.deferReply({ephemeral: true});
// 		const characterData = await this.characterRepo.findOne({userId: interaction.user?.id, characterId});
// 		if (characterData) {
// 			await this.characterRepo.removeAndFlush({
// 				userId: interaction.user.id,
// 				characterId: characterData?.characterId
// 			});
// 			await interaction.editReply({
// 				content: `Character "${characterData?.name}" Removed`,
// 			})
// 		} else {
// 			await interaction.editReply({
// 				content: `Character "${characterId}" Not Found`,
// 			})
// 		}
// 	}
// }