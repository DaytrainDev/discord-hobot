// import { singleton } from "tsyringe"
// import { Database } from "@services"
// import { resolveDependencies, isToday } from "@utils/functions"
// import { Dungeon, DungeonRepository } from "@entities"

// //////////////////////////////////////////////////////////////////
// // Dungeon Helpers
// function getBits(n: number) {
//    return ((Math.abs(n)).toString(2)).split(``).reverse().map(Number).map(Boolean)
// }
// function checkBit(n: number, c: number) {
//    if (!c) return false;
//    const bits = getBits(n)
//    const place = getBits(c)?.length - 1
//    return bits?.[place] === true;
// }

// //////////////////////////////////////////////////////////////////
// // FumbleBot Class
// @singleton()
// export class DonjonRunner {
//     private activeChannels: Map<string, Promise<any> | null> = new Map();
//     private data: any;
//     private character: any;
//     private db: Database;
//     // egresses and stairs might lead to other dungeons
//     private dungeonRepo: DungeonRepository;

//    constructor(data: any, character: any) {
//         this.data = data;
//         this.character = character;
//         resolveDependencies([Database]).then(([db]) => {
//             this.db = db
//             this.dungeonRepo = db.get(Dungeon);
//         })
//     }

//     public characterTurn(move: string) {
//         return;
//     }

//     public cpuTurn() {
//         // TODO: get processing distance
//         return;
//     }

//     // NOTE: I hated this. Now you can hate it too!
//     // TODO: remap to a sprite sheet
//     public getBlock(x: number, y: number, z?: number) {

//         const cellValue = this.data?.cells?.[y]?.[x] ?? 0;
//         if (!cellValue || !this.data?.cell_bit) {
//             return `🟪`;
//         }
//         else if (checkBit(cellValue, this.data?.cell_bit['label'])) { //
//             return `🔳`;
//         }
//         else if (checkBit(cellValue, this.data?.cell_bit['stair_up'])) { //
//             return `🔳`;
//         }
//         else if (checkBit(cellValue, this.data?.cell_bit['stair_down'])) { //
//             return `🔳`;
//         }
//         else if (checkBit(cellValue, this.data?.cell_bit['portcullis'])) { //
//             return `🔳`;
//         }
//         else if (checkBit(cellValue, this.data?.cell_bit['door'])) { //
//             if (checkBit(cellValue, this.data?.cell_bit['secret'])) { //
//                 return `🟪`;
//             }
//             // checkBit(cellValue, cellBits['trapped']); //
//             // if (checkBit(cellValue, cellBits['locked'])) { //
//             //   return `⚿`;
//             // }
//             return `🚪`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['arch'])) { //
//             return `🔳`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['room_id'])) { //
//             return `🔳`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['perimeter'])) { //
//             return `🟪`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['aperture'])) { //
//             return `🟪`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['corridor'])) { //
//             return `🔳`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['room'])) { //
//             return `🔳`;
//         }  else if (checkBit(cellValue, this.data?.cell_bit['block'])) { //
//             return `🟪`;
//         }

//         return `🟪`;
//     }

//     // TODO: draw dungeon to a canvas with a sprite set, use character and npc tokens
//     public getDungeonView(x: number, y: number, z: number) {
//         const {
//             cells,
//         } = this.data;
//         const viewDistance = 6;
//         const dungeonView: [string] = [``];
//         for (let yOffset = -viewDistance; yOffset <= viewDistance; yOffset++) {
//             const dvIndex = yOffset + viewDistance;
//             dungeonView[dvIndex] = ``;
//             for (let xOffset = -viewDistance; xOffset <= viewDistance; xOffset++) {
//                 if (xOffset == 0 && yOffset == 0) {
//                     dungeonView[dvIndex] += `📍`;
//                 } else {
//                     dungeonView[dvIndex] += this.getBlock(xOffset+x, yOffset+y);
//                 }
//             }
//         }
//         // dungeonView.push(`\`A  B  C  D  E  F  G  H  I  J  K  L  M  🗙\``);
//         dungeonView.push(`\`Map Position -> X:${x} Y:${y}\``);
//         return dungeonView.join('\n');
//     }

//     public getRoom(roomId: number) {
//         return this.data?.rooms.find((r: any)=>r?.id===roomId);
//     }

//     public getRoomPosition(roomId: number) {
//         const room = this.getRoom(roomId);
//         if (!room) {
//             return;
//         }
//         const x = Math.floor((room?.west + room?.east) / 2) + this.data?.settings?.bleed;
//         const y = Math.floor((room?.north + room?.south) / 2) + this.data?.settings?.bleed;
//         return {x, y};
//     }

//     public getStartPosition() {
//         const {
//             egress, rooms, settings, stairs
//         } = this.data;

//         return egress ? {
//             x: egress[0]?.col + settings?.bleed,
//             y: egress[0]?.row + settings?.bleed,
//         } : stairs ? {
//             x: stairs[0]?.col + settings?.bleed,
//             y: stairs[0]?.row + settings?.bleed,
//         } : {
//             x: Math.floor((rooms[1]?.east + rooms[1]?.west) / 2) + settings?.bleed,
//             y: Math.floor((rooms[1]?.north + rooms[1]?.south) / 2) + settings?.bleed,
//         };
//     }
// }
