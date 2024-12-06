"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = require("src/entities/player");
const memory_1 = require("src/db/memory");
const player_2 = require("src/controllers/socket/listeners/player");
const poll_1 = require("src/controllers/socket/listeners/poll");
// import {JWTVerifyResult} from "jose";
// import {verifyToken} from "../../utils/tokens";
const registerConnectionController = (io, socket) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(socket.handshake.headers.authorization);
    // const jwt: JWTVerifyResult = await verifyToken(socket.handshake.headers.authorization.substring(7) as string);
    // const loginId: string = JSON.parse(jwt.payload.sub).id;
    //TODO перенести сокет он вверх
    const playerConnectHandler = (spaceId, info) => __awaiter(void 0, void 0, void 0, function* () {
        const playerId = socket.id;
        // check player existence.
        const existing = memory_1.db.getPlayer(spaceId, playerId);
        if (existing) {
            return;
        }
        // register new player.
        const created = yield memory_1.db.addPlayer(spaceId, new player_1.Player(socket, playerId, info.name, info.skinId));
        const tileMap = memory_1.db.getTileMapBySpaceId(spaceId);
        // events
        created.socket.on("disconnect", (0, player_2.createDisconnectListener)(spaceId, playerId));
        created.socket.on("playerMoved", (0, player_2.createUpdatePositionListener)(spaceId, playerId));
        created.socket.on("sendMessage", (0, player_2.createSendMessageListener)(spaceId, playerId));
        created.socket.on("sendPrivateMessage", (0, player_2.createSendPrivateMessageListener)(spaceId, playerId));
        created.socket.on("votePoll", (0, player_2.createVoteListener)(spaceId, playerId));
        created.socket.on("startGlobalBroadcast", (0, player_2.createGlobalBroadcastListener)(spaceId, playerId));
        created.socket.on("createPoll", (0, poll_1.createAddPollListener)(spaceId, playerId));
        created.socket.on("closePoll", (0, poll_1.createClosePollListener)(spaceId, playerId));
        created.socket.join(spaceId);
        created.socket.to(spaceId).emit("addNewPlayer", created.info());
        created.socket.emit("currentMap", tileMap);
        created.socket.emit("existingPlayers", memory_1.db.listPlayersInfo(spaceId));
    });
    socket.on("connectInGame", playerConnectHandler);
});
exports.default = registerConnectionController;
//# sourceMappingURL=connection.js.map