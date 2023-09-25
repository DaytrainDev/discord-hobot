// import { Category } from "@discordx/utilities"
// import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction } from "discord.js"
// import { Discord, Guard, Slash, SlashGroup, SlashOption } from "@decorators"
// import { Database, Hobot } from "@services"
// import { resolveDependencies } from "@utils/functions"
// import { CompendiumEntry, CompendiumEntryRepository, CompendiumSection, CompendiumSectionRepository,} from "@entities"
// import { UserPermissions } from "@guards"

// @Discord()
// @Category('WIP')
// @Guard(
//     UserPermissions(['Administrator'])
// )
// @SlashGroup({ description: "D&D 5e Reference", name: "dnd5e" })
// // @SlashGroup({
// //   description: "Settings for Channel",
// //   name: "options",
// //   root: "play",
// // })
// export default class Dnd5eCommand {
// 	private readonly _categories: Map<string, CommandCategory[]> = new Map()
//     private db: Database
//     private fb: Hobot
//     private compendiumSectionRepo: CompendiumSectionRepository
//     private compendiumEntryRepo: CompendiumEntryRepository

// 	constructor() {
//         resolveDependencies([Database, Hobot])
//             .then(([db, fb]) => {
//                 this.db = db;
//                 this.fb = fb;
//                 this.compendiumSectionRepo = this.db.get(CompendiumSection)
//                 this.compendiumEntryRepo = this.db.get(CompendiumEntry)
//             });
//     }

// 	@Slash({
// 		name: 'lookup',
//         description: 'Look something up.'
// 	})
//     @SlashGroup("dnd5e")
//     async lookup(
//         @SlashOption({ name: 'section', description: 'Compendium Section.', type: ApplicationCommandOptionType.String, required: true, autocomplete: true }) section: string,
//         @SlashOption({ name: 'entry', description: 'Compendium Entry.', type: ApplicationCommandOptionType.String, required: true, autocomplete: true  }) entry: string,
// 		interaction: CommandInteraction | AutocompleteInteraction,
//     ){
// 		if (interaction.isAutocomplete()) {
// 			const focusedOption = interaction.options.getFocused(true);
// 			// TODO: search for partial name off focusedOption.value
// 			switch(focusedOption?.name) {
// 				case 'section':
// 					const sections = await this.compendiumSectionRepo.find({gameSystem: 'dnd5e'});
//                     await interaction.respond(this.fb.autocompleteOptions(sections, 'index', 'index', focusedOption?.value));
//                     return;
//                 case 'entry':
//                     const entries = await this.compendiumEntryRepo.find({gameSystem: 'dnd5e', section});
//                     await interaction.respond(this.fb.autocompleteOptions(entries, 'compendiumEntryId', 'name', focusedOption?.value));
//                     return;
// 				default:
// 					return;
// 			}
// 			// }
// 		}
//         await interaction.deferReply({ephemeral: true});
//         const entryData = await this.compendiumEntryRepo.findOne({ compendiumEntryId: entry });
//         if (!entryData?.data) {
//             return;
//         }
//         return interaction.editReply({
//             // content: `\`\`\`${JSON.stringify(entryData)}\`\`\``,
//             // TODO: embeds by type?
//             embeds: [
//                 {
//                     title: `${entryData?.data?.name}`,
//                     fields: [
//                         ...Object.keys(entryData?.data)
//                             .filter(key => entryData?.data?.[key]?.name)
//                             .map(key => ({
//                                 name: `${entryData?.data?.[key]?.name}`,
//                                 value: `${JSON.stringify(entryData?.data?.[key])}`,
//                             })),
//                         ...Object.keys(entryData?.data)
//                             .filter(key => !(entryData?.data?.[key]?.name || ['name', 'index', 'desc', 'url'].includes(key)))
//                             .map(key => ({
//                                 name: `${key}`,
//                                 value: `${JSON.stringify(entryData?.data?.[key], null, 2)?.substring(0, 1024)}`,
//                             })),
//                     ],
//                     description: entryData?.data?.desc?.join(`\n`),
//                 },
//             ]
//         });
//     }
// }
