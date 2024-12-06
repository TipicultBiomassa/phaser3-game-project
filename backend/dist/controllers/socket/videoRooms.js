// import {Socket, Server} from "socket.io";
// import { PlayerId, Player, VideoRoomId, VideoRoom, SpaceId, VonageSessionId, Space } from "src/types/types";
// import {players, videoRooms} from "../../containers";
// import {getStaticRoomIdsFromMap} from "../../utils/map";
// import {createSession, genTokenToConnectSession} from "../../utils/vonageUtils";
// import Opentok from "opentok";
// export const registerVideoRoomsController = (io: Server, socket: Socket, spaceId: SpaceId): void => {
//     addStaticVideoRooms(spaceId, socket);
//     const createVideoRoom = (videoRoomId: VideoRoomId): void => {
//         try {
//             const createdVideoRoom: VideoRoom = addVideoRoom(spaceId, socket.id, videoRoomId);
//             console.log(players.get(socket.id).name + " created video room: " + createdVideoRoom.id)
//             connectToVideoRoom(createdVideoRoom.id);
//             socket.emit("createdVideoRoomInfo", createdVideoRoom);
//         } catch (error) {
//             console.log(error);
//         }
//     };
//     const connectToVideoRoom = (videoRoomId: VideoRoomId): void => {
//         try {
//             console.log(videoRoomId);
//             const playerId: PlayerId = socket.id;
//             let connectedVideoRoom: VideoRoom = videoRooms.get(spaceId).get(videoRoomId);
//             console.log(videoRoomId);
//             console.log(connectedVideoRoom);
//             socket.emit("connectedVideoRoomInfo", connectedVideoRoom);
//             connectedVideoRoom = addPlayerToVideoRoom(spaceId, playerId, videoRoomId);
//             const connectedPlayerInfo: Player = players.get(playerId);
//             console.log(connectedPlayerInfo.name + " connected to video room: " + connectedVideoRoom.id);
//             console.log(connectedPlayerInfo.name + " video room id: " + connectedPlayerInfo.videoRoomId);
//             console.log(connectedVideoRoom.id + " video room players: " + connectedVideoRoom.players);
//             io.to(spaceId).emit("updateVideoRoomId", connectedPlayerInfo);
//             connectedVideoRoom.players.forEach((videoRoomPlayer: Player) => {
//                 if (videoRoomPlayer.id !== playerId) {
//                     io.to(videoRoomPlayer.id).emit("connectedVideoRoomPlayer", connectedPlayerInfo);
//                 }
//             });
//         } catch (error) {
//             console.log(error);
//         }
//     };
//     const disconnectFromVideoRoom = (spaceId: SpaceId): void => {
//         try {
//             const playerId: PlayerId = socket.id;
//             let disconnectedPlayerInfo: Player = players.get(playerId);
//             const videoRoomId: VideoRoomId = disconnectedPlayerInfo.videoRoomId;
//             const disconnectedVideoRoom: VideoRoom = removePlayerFromVideoRoom(spaceId, playerId);
//             disconnectedPlayerInfo = players.get(playerId);
//             io.to(spaceId).emit("updateVideoRoomId", disconnectedPlayerInfo);
//             console.log(disconnectedPlayerInfo.name + " disconnected from video room: " + disconnectedVideoRoom.id);
//             console.log(disconnectedPlayerInfo.name + " video room id: " + disconnectedPlayerInfo.videoRoomId);
//             console.log(disconnectedVideoRoom.id + " video room players: " + disconnectedVideoRoom.players);
//             disconnectedVideoRoom.players.forEach((videoRoomPlayer: Player) => {
//                 if (videoRoomPlayer.id !== playerId) {
//                     io.to(videoRoomPlayer.id).emit("disconnectedVideoRoomPlayer", disconnectedPlayerInfo,
//                         disconnectedVideoRoom.players);
//                 }
//             });
//             // if (disconnectedVideoRoom.players.length === 0) {
//             //     videoRooms.delete(videoRoomId);
//             // }
//         } catch (error) {
//             console.log(error);
//         }
//     };
//     socket.on("createVideoRoom", createVideoRoom);
//     socket.on("connectToVideoRoom", connectToVideoRoom);
//     socket.on("disconnectFromVideoRoom", disconnectFromVideoRoom);
// };
// const addStaticVideoRooms = (spaceId: SpaceId, socket: Socket): void => {
//     try {
//         let videoRoomPlayers: Array<Player> = [];
//         const staticRoomIds: Array<VideoRoomId> = getStaticRoomIdsFromMap("demo_map2");
//         const playerInfo: Player = players.get(socket.id);
//         staticRoomIds.forEach(async (staticRoomId) => {
//             let videoRoomsMap: Map<VideoRoomId, VideoRoom> = videoRooms.get(spaceId);
//             let foundVideoRoom: VideoRoom | undefined = undefined;
//             let sessionId: VonageSessionId;
//             if (videoRoomsMap) {
//                 foundVideoRoom = videoRoomsMap.get(staticRoomId);
//             } else {
//                 videoRoomsMap = new Map<VideoRoomId, VideoRoom>();
//             }
//             if (foundVideoRoom === undefined) {
//                 const createdSession: Opentok.Session = await createSession();
//                 sessionId = createdSession.sessionId
//                 videoRoomsMap.set(staticRoomId, {
//                     id: staticRoomId,
//                     vonageSessionId: sessionId,
//                     players: videoRoomPlayers,
//                     activePollId: -1
//                 });
//                 videoRooms.set(spaceId, videoRoomsMap);
//             } else {
//                 sessionId = foundVideoRoom.vonageSessionId;
//             }
//             const tokenToConnectSession: string = genTokenToConnectSession(sessionId, staticRoomId);
//             console.log(staticRoomId);
//             socket.emit("addStaticRoomVonageToken", {
//                 sessionId: sessionId,
//                 apiKey: process.env.VONAGE_API_KEY,
//                 token: tokenToConnectSession,
//                 staticRoomId: staticRoomId,
//             });
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };
// const addVideoRoom = (spaceId: SpaceId, playerId: PlayerId, videoRoomId: VideoRoomId): VideoRoom => {
//     try {
//         let videoRoomPlayers: Array<Player> = [];
//         const foundPlayerInfo: Player = players.get(playerId);
//         let videoRoomMap: Map<VideoRoomId, VideoRoom> = videoRooms.get(spaceId);
//         const videoRoomInfo: VideoRoom = videoRoomMap.get(foundPlayerInfo.videoRoomId);
//         videoRoomMap.set(videoRoomId, {
//             id: videoRoomId,
//             vonageSessionId: videoRoomInfo.vonageSessionId,
//             players: videoRoomPlayers,
//             activePollId: -1
//         });
//         videoRooms.set(spaceId, videoRoomMap);
//         return videoRoomMap.get(videoRoomId);
//     } catch (error) {
//         console.log(error);
//     }
// };
// const addPlayerToVideoRoom = (spaceId: SpaceId, playerId: PlayerId, videoRoomId: VideoRoomId): VideoRoom => {
//     try {
//         const foundPlayerInfo: Player = players.get(playerId);
//         let videoRoomMap: Map<VideoRoomId, VideoRoom> = videoRooms.get(spaceId);
//         let videoRoom: VideoRoom = videoRoomMap.get(videoRoomId);
//         const connectedPlayerIndex: number = videoRoom.players.findIndex((videoRoomPlayer) => {
//             return foundPlayerInfo.id === videoRoomPlayer.id;
//         });
//         if (connectedPlayerIndex === -1) {
//             videoRoom.players.push(foundPlayerInfo);
//             videoRoomMap.set(videoRoom.id, videoRoom);
//             videoRooms.set(spaceId, videoRoomMap);
//             players.set(playerId, {
//                 ...foundPlayerInfo,
//                 ...{videoRoomId: videoRoomId}
//             });
//         }
//         return videoRoom;
//     } catch (error) {
//         console.log(error);
//     }
// };
// const removePlayerFromVideoRoom = (spaceId: SpaceId, playerId: PlayerId): VideoRoom | undefined => {
//     try {
//         const foundPlayerInfo: Player = players.get(playerId);
//         const videoRoomId: VideoRoomId = foundPlayerInfo.videoRoomId;
//         let videoRoomMap: Map<VideoRoomId, VideoRoom> = videoRooms.get(videoRoomId);
//         let videoRoom: VideoRoom = videoRoomMap.get(videoRoomId);
//         const disconnectedPlayerIdIndex: number = videoRoom.players.findIndex((videoRoomPlayer) => {
//             return foundPlayerInfo.id === videoRoomPlayer.id;
//         });
//         videoRoom.players.splice(disconnectedPlayerIdIndex, 1);
//         videoRoomMap.set(videoRoomId, videoRoom);
//         videoRooms.set(spaceId, videoRoomMap);
//         players.set(playerId, {
//             ...foundPlayerInfo,
//             ...{videoRoomId: null}
//         });
//         return videoRoomMap.get(videoRoomId);
//     } catch (error) {
//         console.log(error);
//     }
// };
//# sourceMappingURL=videoRooms.js.map