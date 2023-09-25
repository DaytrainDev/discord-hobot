// import { singleton } from "tsyringe"
// import { Chess } from 'chess.js';
// import { calculateBestMove, initGame } from "chess-ai";
// import { APIEmbed, JSONEncodable, ComponentType } from "discord.js";

// // https://www.npmjs.com/package/chess
// // https://www.npmjs.com/package/chess-ai

// //////////////////////////////////////////////////////////////////
// // Hobot Class
// @singleton()
// export class ChessRunner {
//     private gameClient: any;
//     private difficulty: number;
//     private playerColor: string;

// constructor(difficulty = 1) {
//         this.gameClient = new Chess();
//         this.difficulty = difficulty;
//         this.playerColor = 'w';
//         initGame(this.gameClient, this.difficulty);
//     }

//     public getPieceChar(code: string) {
//         switch(code) {
//             case 'p':
//                 return `♙`;
//             case 'r':
//                 return `♖`;
//             case 'n':
//                 return `♘`;
//             case 'b':
//                 return `♗`;
//             case 'q':
//                 return `♕`;
//             case 'k':
//                 return `♔`;
//             case 'P':
//                 return `♟`;
//             case 'R':
//                 return `♜`;
//             case 'N':
//                 return `♞`;
//             case 'B':
//                 return `♝`;
//             case 'Q':
//                 return `♛`;
//             case 'K':
//                 return `♚`;
//         }
//     }

//     public getSpacePieceChar(square: string) {
//         const squareData = this.gameClient.get(square)
//         return this.getPieceChar(squareData?.type)
//     }

//     public drawBoard() {
//         const squares = this.gameClient.board();
//         let row: number = 8;
//         const board = `${squares
//             .map((rowData: any[]) => {
//                 const rowOutput = `${row} ${rowData
//                     .map((sq: any) => {
//                         if (sq?.type) {
//                             return this.getPieceChar(sq?.color === 'b' ? sq.type.toUpperCase() : sq.type);
//                         }
//                         return `▫`;
//                     }).join(' ')}`;
//                 row = row - 1;
//                 return rowOutput;
//             })
//         .join('\n')}\n  a b c d e f g h`;

//         return `\`\`\`${board}\`\`\``;
//         // return `\`\`\`${this.gameClient.ascii()}\`\`\``;
//     }

//     public getPlayerPieceOptions(defaultPiece?: string) {
//         const squares = this.gameClient.board();
//         console.log(defaultPiece)
//         return squares
//             .flatMap((sq: any) => sq)
//             .filter((sq: any) => !!sq?.type && sq?.color === this.playerColor)
//             .map((sq: any) => ({
//                 label: `${this.getPieceChar(sq.type)} ${sq.square.toUpperCase()}`,
//                 value: `${sq.square}`,
//                 default: defaultPiece === `${sq.square}`,
//             }));
//     }

//     public getPieceMoveOptions(square: string) {
//         const squareData = this.gameClient.get(square);

//         return this.gameClient.moves({square}).map((move: any) => {

//             return {
//                 label: `${this.getPieceChar(squareData?.type)} ${square} -> ${move}`,
//                 value: `${move}`,
//             }
//         });
//     }

//     public movePiece(move: string) {
//         return this.gameClient.move(move);
//     }

//     public getCpuMove() {
//         return calculateBestMove(this.gameClient, this.difficulty);
//     }
// }
