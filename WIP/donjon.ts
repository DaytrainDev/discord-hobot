// import { Category } from "@discordx/utilities"
// import { ActionRowBuilder, ApplicationCommandOptionType, Attachment, ButtonBuilder, ButtonStyle, CommandInteraction } from "discord.js"
// import { Client } from "discordx"
// import { Discord, Slash, SlashOption } from "@decorators"
// import { Guard, UserPermissions } from "@guards"
// import axios from "axios"

// function getRoom(roomId: number, rooms: Array<any>) {
// 	return rooms.find(r=>r?.id===roomId);
// }
// function getRoomCenter(room: any, xBuffer: number, yBuffer: number) {
// 	return {
// 		x: Math.floor((room?.west + room?.east) / 2) + xBuffer,
// 		y: Math.floor((room?.north + room?.south) / 2) + yBuffer,
// 	}
// }
// // NOTE: I hated this. Now you can hate it too!
// function getBits(n: number) {
// 	return ((Math.abs(n)).toString(2)).split(``).reverse().map(Number).map(Boolean)
// }

// function checkBit(n: number, c: number) {
// 	if (!c) return false;
// 	const bits = getBits(n)
// 	const place = getBits(c)?.length - 1
// 	return bits?.[place] === true;
// }

// function getBlock(cellValue: number, cellBits: Record<string, any>) {
// 	if (!cellValue || !cellBits) {
// 		return `🟪`;
// 	}
// 	else if (checkBit(cellValue, cellBits['label'])) { //
// 		return `🔳`;
// 	}
// 	else if (checkBit(cellValue, cellBits['stair_up'])) { //
// 		return `🔳`;
// 	}
// 	else if (checkBit(cellValue, cellBits['stair_down'])) { //
// 		return `🔳`;
// 	}
// 	else if (checkBit(cellValue, cellBits['portcullis'])) { //
// 		return `🔳`;
// 	}
// 	else if (checkBit(cellValue, cellBits['door'])) { //
// 		if (checkBit(cellValue, cellBits['secret'])) { //
// 			return `🟪`;
// 		}
// 		// checkBit(cellValue, cellBits['trapped']); //
// 		// if (checkBit(cellValue, cellBits['locked'])) { //
// 		// 	return `⚿`;
// 		// }
// 		return `🚪`;
// 	}	else if (checkBit(cellValue, cellBits['arch'])) { //
// 		return `🔳`;
// 	}	else if (checkBit(cellValue, cellBits['room_id'])) { //
// 		return `🔳`;
// 	}	else if (checkBit(cellValue, cellBits['perimeter'])) { //
// 		return `🟪`;
// 	}	else if (checkBit(cellValue, cellBits['aperture'])) { //
// 		return `🟪`;
// 	}	else if (checkBit(cellValue, cellBits['corridor'])) { //
// 		return `🔳`;
// 	}	else if (checkBit(cellValue, cellBits['room'])) { //
// 		return `🔳`;
// 	}	else if (checkBit(cellValue, cellBits['block'])) { //
// 		return `🟪`;
// 	}

// 	return `🟪`;
// }

// @Discord()
// @Category('Admin')
// export default class DonjonCommand {

// 	@Slash({ 
// 		name: 'donjon',
// 		description: '[WIP] Generate a dungeon at donjon, then upload the generated JSON here.'
// 	})
// 	async gmdonjon(
// 		// @SlashOption({ name: 'seed', type: ApplicationCommandOptionType.String, required: true }) seed: string,
// 		@SlashOption({ name: 'data', type: ApplicationCommandOptionType.Attachment , required: true }) file: Attachment,
// 		@SlashOption({ name: 'room_id', type: ApplicationCommandOptionType.Number , required: false }) roomId: number,
// 		// TODO: optional X Y position
// 		interaction: CommandInteraction,
// 		client: Client,
// 		{ localize }: InteractionData
// 	) {
// 		await interaction.deferReply();
		
// 		// TODO: read from file url if provided
// 		// console.log(file?.url);
// 		let dungeonData;
// 		if (file) {
// 			dungeonData = await axios
// 				.get(file?.url?.toString())
// 				.then(res => res?.data)
// 		} else {
// 			return;
// 		}
// 		const {
// 			cell_bit, cells, corridor_features, details, egress, rooms, settings, wandering_monsters, stairs
// 		} = dungeonData;


// 		const xBuffer = settings?.bleed ?? 0;
// 		const yBuffer = settings?.bleed ?? 0;
// 		// const xBufferEnd = testDungeon?.cells?.[0]?.length - xBuffer;
// 		// const yBufferEnd = testDungeon?.cells?.[0]?.length - yBuffer;
// 		const viewDistance = 6;
// 		const room = getRoom(roomId, rooms);
// 		const position = roomId ? getRoomCenter(room, xBuffer, yBuffer) 
// 		: egress ? {
// 			x: egress[0]?.col + xBuffer,
// 			y: egress[0]?.row + yBuffer,
// 		} : stairs ? {
// 			x: stairs[0]?.col + xBuffer,
// 			y: stairs[0]?.row + yBuffer,
// 		} : {
// 			x: Math.floor((rooms[1]?.east + rooms[1]?.west) / 2) + xBuffer,
// 			y: Math.floor((rooms[1]?.north + rooms[1]?.south) / 2) + yBuffer,
// 		};
// 		const dungeonView: [string] = [``];
// 		for (let y = -viewDistance; y <= viewDistance; y++) {
// 			const dvIndex = y + viewDistance;
// 			dungeonView[dvIndex] = ``;
// 			for (let x = -viewDistance; x <= viewDistance; x++) {
// 				const cellData = cells?.[y+position?.y]?.[x+position?.x] ?? 0;
// 				if (x == 0 && y == 0) {
// 					dungeonView[dvIndex] += `📍`; //`🧝`;
// 				// } else if (x == 1 && y == 0) {
// 				// 	// dungeonView[dvIndex] += `[:ladder:](https://discord.com/channels/1042614809587372084/1119060626287890463)`; // <- This is possible
// 				// 	dungeonView[dvIndex] += `:ladder:`;
// 				} else {
// 					dungeonView[dvIndex] += getBlock(cellData, dungeonData?.cell_bit);
// 				}
// 			}
// 			// dungeonView[dvIndex] += `\` ${dvIndex + 1}\``;
// 		}
// 		// dungeonView.push(`\`A  B  C  D  E  F  G  H  I  J  K  L  M  🗙\``);
// 		dungeonView.push(`\`Map Position -> X:${position.x} Y:${position.y}\``);
// 		if (room?.id) {
// 			dungeonView.push(`\`Room: ${room?.id} | Size ${room?.height}x${room?.width}\``);
// 		}
// 		if (room?.contents?.detail?.room_features) {
// 			dungeonView.push(`> ${room?.contents?.detail?.room_features}`);
// 		}
// 		if (room?.contents?.inhabited) {
// 			dungeonView.push(`### Occupants\n${room?.contents?.inhabited}`);
// 		}

// 		// TODO: load player status from db
// 		// const statusBar = `\`💗${10}/${10} | 🛡️${10}\` - ${'Player}`;
// 		// const playerView = [statusBar, ...dungeonView];

// 		// const components = [
// 		// 	new ActionRowBuilder<ButtonBuilder>().setComponents(
// 		// 		new ButtonBuilder().setCustomId(`move_up_left`).setLabel("↖️").setStyle(ButtonStyle.Primary),
// 		// 		new ButtonBuilder().setCustomId(`move_up`).setLabel("⬆️").setStyle(ButtonStyle.Primary),
// 		// 		new ButtonBuilder().setCustomId(`move_up_right`).setLabel("↗️").setStyle(ButtonStyle.Primary),
// 		// 	),
// 		// 	new ActionRowBuilder<ButtonBuilder>().setComponents(
// 		// 		new ButtonBuilder().setCustomId(`move_left`).setLabel("⬅️").setStyle(ButtonStyle.Primary),
// 		// 		new ButtonBuilder().setCustomId(`stay`).setLabel("📍").setStyle(ButtonStyle.Secondary),
// 		// 		new ButtonBuilder().setCustomId(`move_right`).setLabel("➡️").setStyle(ButtonStyle.Primary),
// 		// 	),
// 		// 	new ActionRowBuilder<ButtonBuilder>().setComponents(
// 		// 		new ButtonBuilder().setCustomId(`move_down_left`).setLabel("↙️").setStyle(ButtonStyle.Primary),
// 		// 		new ButtonBuilder().setCustomId(`move_down`).setLabel("⬇️").setStyle(ButtonStyle.Primary),
// 		// 		new ButtonBuilder().setCustomId(`move_down_right`).setLabel("↘️").setStyle(ButtonStyle.Primary),
// 		// 	),
// 		// ];
		
// 		return interaction.editReply({ 
// 			content: `${dungeonView.join('\n')}`,
// 			// components,
// 		});
// 	}
// }
