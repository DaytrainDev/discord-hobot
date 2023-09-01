// import { Category } from "@discordx/utilities"
// import { ChannelType, CommandInteraction } from "discord.js"
// import { Guard, UserPermissions } from "@guards"
// import { Discord, Slash, SlashGroup, SlashOption } from "@decorators"
// import { injectable } from "tsyringe"
// import { Database, } from "@services"
// import { resolveDependency } from "@utils/functions"
// import { CompendiumEntry, CompendiumSection } from "@entities"
// import { v4 as uuidv4 } from 'uuid';
// import axios from "axios"

// async function srd5ecall(incString?: string) {
//     const url = `https://www.dnd5eapi.co${incString ? `${incString}` : '/api'}`;
//     return axios.get(url).then(response => JSON.parse(JSON.stringify(response.data)));
// }

// @Discord()
// @injectable()
// @Category('Admin')
// @Guard(
//     UserPermissions(['Administrator'])
// )
// @SlashGroup({
// 	name: 'update',
// 	description: 'Commands to resync data',
// })
// @SlashGroup({
//   description: "Import DND5e sources.",
//   name: "dnd5e",
//   root: "update",
// })

// export default class UpdateCommand {
// 	@Slash({ 
// 		name: 'srd',
// 		description: 'Update the SRD for DND5e' // or Cypher.'
//     })
// 	@SlashGroup("dnd5e", "update")
// 	async updatesrd(
// 		interaction: CommandInteraction,
// 	) {
//         const message = await interaction.deferReply();

// 		let channel = interaction?.channel;
// 		if (!channel) {
// 			return;
// 		}

// 		// TODO: hide command in unsupported channels
// 		if (channel.type === ChannelType.DM) {
// 			// TODO: allow DM Q&A for premium
// 			// TODO: premium user DB
// 			return message?.edit('I cannot run setup in a DM (yet).')
// 		}

// 		if (channel?.parent?.type === ChannelType.GuildForum) {
// 			// TODO: make quest log board
// 			return message?.edit('I cannot run setup in a forum (yet).');
// 		}

// 		if (channel?.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread) {
// 			channel = channel.parent;
// 		}

// 		if (!(channel?.type === ChannelType.GuildText)) {
// 			// TODO: make quest log board
// 			return message?.edit('I can only run setup in a text channel.');
// 		}

// 		// load or create empty compendium
// 		const defaultQuery = {
// 			gameSystem: `dnd5e`,
// 			compendium: `DND5eSRD`,
// 		};
// 		const metaData= {
// 			updatedAt: new Date,
// 		}; // TODO: make Entity for Compendium
// 		const db = await resolveDependency(Database);
// 		await db.initialize()

// 		const compendiumSectionRepository = await db.get(CompendiumSection);
// 		const compendiumEntryRepository = await db.get(CompendiumEntry);
// 		// Build a New Compendium from compendiumName

// 		const compendium = await srd5ecall();
//         const compendiumKeys = Object.keys(compendium);

//         // sync the calls with a delay
//         for (let i = 0; i < compendiumKeys?.length; i++) {
//             const index = compendiumKeys[i];
//             if (!index) {
//                 continue;
//             }
//             const url = compendium[index];
//             let updatedCompendiumSection = await compendiumSectionRepository.findOne({
//                 index, 
//                 ...defaultQuery,
//             }).catch((error: Error) => {
//                 // it's fine, everything's fine... c o n s u m e
//                 return;
//             }) ?? {
//                 index,
//                 url,
//             } as any;

//             try {
//                 updatedCompendiumSection = updatedCompendiumSection?.compendiumSectionId 
//                 ? await compendiumSectionRepository.upsert({
//                     index,
//                     url,
//                     ...defaultQuery,
//                     ...metaData,
//                     ...updatedCompendiumSection,
//                 }) 
//                 : await compendiumSectionRepository.create({
//                     compendiumSectionId: uuidv4(),
//                     index,
//                     url,
//                     createdAt: new Date(),
//                     ...defaultQuery,
//                     ...metaData,
//                     ...updatedCompendiumSection,
//                 })
//                 await compendiumSectionRepository.flush();
//             } catch (error) {
//                 // TODO: log errors and publish with release as known unsupported SRD-components
//                 console.error(error);
//             }

//             if (!updatedCompendiumSection?.compendiumSectionId) {
//                 continue;
//             }

//             // grab 1 level of nested /url calls for each section
//             // TODO: make sub-sections, or an entries table? Maybe a table for each type?
//             const dataArr = (await srd5ecall(updatedCompendiumSection.url))?.results;
//             for (let j = 0; j < dataArr?.length; j++) {
//                 const entry = dataArr[j];
//                 if (!entry?.index) {
//                     console.log('no index found on entry', dataArr, j, dataArr?.length, entry);
//                     continue;
//                 }
//                 let updatedCompendiumEntry = await compendiumEntryRepository.findOne({
//                     index: entry?.index, 
//                     section: index,
//                     ...defaultQuery,
//                 }).catch((error: Error) => {
//                     // it's fine, everything's fine... c o n s u m e
//                     return;
//                 }) ?? entry;
//                 try {
//                     if (updatedCompendiumEntry?.url) {
//                         updatedCompendiumEntry.data = await srd5ecall(updatedCompendiumEntry.url);
//                         updatedCompendiumEntry.name = updatedCompendiumEntry?.data?.name;
//                         updatedCompendiumEntry.description = updatedCompendiumEntry?.data?.desc?.join?.(`\n\n`);
//                         updatedCompendiumEntry.index = entry?.index;
//                         updatedCompendiumEntry.section = index;
//                         message?.edit(`Updating DND5e SRD Entry "${updatedCompendiumEntry?.name}".\n\`${updatedCompendiumEntry.url}\``)
//                         try {
//                             updatedCompendiumEntry = updatedCompendiumEntry?.compendiumEntryId 
//                                 ? await compendiumEntryRepository.upsert({
//                                     compendiumEntryId: updatedCompendiumEntry?.compendiumEntryId,
//                                     ...updatedCompendiumEntry,
//                                 }) 
//                                 : await compendiumEntryRepository.create({
//                                     compendiumEntryId: uuidv4(),
//                                     createdAt: Date.now(),
//                                     ...defaultQuery,
//                                     ...metaData,
//                                     ...updatedCompendiumEntry,
//                                 })
//                             await compendiumSectionRepository.flush();
//                         } catch (error) {
//                             // TODO: log errors and publish with release as known unsupported SRD-components
//                             console.error(`${updatedCompendiumEntry?.name}\n\`${updatedCompendiumEntry.url}\``, error);
//                         }
//                     }
//                 } catch (error) {
//                     // TODO: log errors and publish with release as known unsupported SRD-components
//                     console.error(`${updatedCompendiumEntry?.name}\n\`${updatedCompendiumEntry.url}\``, error);
//                 }

//             }
//         }

// 		return message?.edit(`DND5e SRD Update Complete!`)
// 	}
// }