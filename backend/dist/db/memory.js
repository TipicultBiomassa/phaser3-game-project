"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
/* eslint-disable max-classes-per-file */
const conversation_1 = require("src/entities/conversation");
const map_1 = require("src/entities/map");
const fs_1 = __importDefault(require("fs"));
const vonage_1 = require("../controllers/socket/utils/vonage");
const inviteTable_1 = require("../models/postgres/inviteTable");
const jose = __importStar(require("jose"));
const uuid_1 = require("uuid");
class Space {
    constructor(id) {
        this.getPlayer = (id) => {
            return this.players.get(id);
        };
        this.updatePlayerPosition = (id, position) => {
            const current = this.players.get(id);
            if (!current) {
                return undefined;
            }
            current.position = position;
            let isSessionUpdated = false;
            const currentConversation = this.getConversation(current.currentConversationId);
            const conversationByPos = this.map.getConversationIdAt(current.position);
            // current conversation check
            if (current.currentConversationId) {
                if (currentConversation === undefined) {
                    current.currentConversationId = undefined;
                    isSessionUpdated = true;
                }
                if (currentConversation instanceof conversation_1.StaticConversation && conversationByPos === undefined) {
                    current.currentConversationId = undefined;
                    isSessionUpdated = true;
                }
                if (conversationByPos) {
                    // all static(incl broadcast)
                    if (currentConversation instanceof conversation_1.StaticConversation) {
                        if (currentConversation.id === conversationByPos.id) {
                            if (conversationByPos.type === map_1.ConversationTileType.broadcastViewer
                                || conversationByPos.type === map_1.ConversationTileType.broadcastPublisher) {
                                const currentTileId = this.map.getTileIdAt(current.position.x, current.position.y);
                                const currentBroadcastRole = this.map.getBroadcastRoleByTileId(currentTileId);
                                if (current.broadcastRole !== currentBroadcastRole) {
                                    console.log(currentBroadcastRole);
                                    current.broadcastRole = currentBroadcastRole;
                                    isSessionUpdated = true;
                                }
                            }
                            return [current, isSessionUpdated];
                        }
                    }
                }
                // dynamic
                if (currentConversation instanceof conversation_1.DynamicConversation) {
                    if (currentConversation.isInByCoords(current.position.x, current.position.y)) {
                        currentConversation.updatePlayerPosition(id, current);
                    }
                    else {
                        current.currentConversationId = undefined;
                        isSessionUpdated = true;
                        currentConversation.removePlayer(current.id);
                        if (currentConversation.players.size <= 1) {
                            this.removeConversation(currentConversation.id);
                        }
                    }
                }
            }
            // static
            if (conversationByPos === undefined) {
                if (currentConversation instanceof conversation_1.DynamicConversation) {
                    return [current, isSessionUpdated];
                }
                if (currentConversation instanceof conversation_1.BroadcastConversation) {
                    console.log("OUT BROADCAST");
                    current.broadcastRole = undefined;
                }
            }
            else {
                current.currentConversationId = conversationByPos.id;
                isSessionUpdated = true;
                if (conversationByPos.type === map_1.ConversationTileType.broadcastViewer
                    || conversationByPos.type === map_1.ConversationTileType.broadcastPublisher) {
                    const currentTileId = this.map.getTileIdAt(current.position.x, current.position.y);
                    const currentBroadcastRole = this.map.getBroadcastRoleByTileId(currentTileId);
                    if (current.broadcastRole !== currentBroadcastRole) {
                        current.broadcastRole = currentBroadcastRole;
                        console.log(currentBroadcastRole);
                    }
                }
                if (currentConversation instanceof conversation_1.DynamicConversation) {
                    currentConversation.removePlayer(current.id);
                    if (currentConversation.players.size <= 1) {
                        this.removeConversation(currentConversation.id);
                    }
                }
                return [current, isSessionUpdated];
            }
            // dynamic
            let isInDynamic = false;
            this.conversations.forEach((conversation) => {
                if (conversation instanceof conversation_1.DynamicConversation) {
                    if (conversation.isInByCoords(current.position.x, current.position.y)) {
                        current.currentConversationId = conversation.id;
                        isSessionUpdated = true;
                        conversation.addPlayer(current.id, current);
                        isInDynamic = true;
                        return;
                    }
                }
            });
            // players
            if (isInDynamic === false) {
                this.players.forEach((player) => {
                    if (player.id !== current.id) {
                        if (Math.sqrt(Math.pow((current.position.x - player.position.x), 2)) +
                            Math.sqrt(Math.pow((current.position.y - player.position.y), 2)) <= 50) {
                            const conversation = this.addConversation((0, uuid_1.v4)(), conversation_1.ConversationType.dynamic, current.id);
                            current.currentConversationId = conversation.id;
                            isSessionUpdated = true;
                            conversation.addPlayer(current.id, current);
                            return;
                        }
                    }
                });
            }
            return [current, isSessionUpdated];
        };
        this.addPlayer = (player) => {
            const existing = this.players.get(player.id);
            if (existing) {
                return existing;
            }
            this.players.set(player.id, player);
            return player;
        };
        this.removePlayer = (id) => {
            const player = this.players.get(id);
            if (player) {
                this.players.delete(id);
            }
            return player;
        };
        this.listPlayers = () => {
            const list = new Array();
            list.push(...this.players.values());
            return list;
        };
        this.getConversation = (id) => {
            return this.conversations.get(id);
        };
        this.addConversation = (id, type, playerId) => {
            console.log("addConversation: id:" + id + " type: " + type);
            const existing = this.conversations.get(id);
            if (existing) {
                return existing;
            }
            let created;
            if (type === conversation_1.ConversationType.dynamic && playerId) {
                const player = this.players.get(playerId);
                const players = new Map();
                players.set(player.id, player);
                created = new conversation_1.DynamicConversation(id, players);
            }
            else if (type === conversation_1.ConversationType.nearby) {
                created = new conversation_1.NearbyConversation(id);
            }
            else if (type === map_1.ConversationTileType.broadcastPublisher || type === map_1.ConversationTileType.broadcastViewer) {
                created = new conversation_1.BroadcastConversation(id);
            }
            else if (type === conversation_1.ConversationType.broadcast) {
                created = new conversation_1.GlobalBroadcastConversation(id);
            }
            this.conversations.set(id, created);
            if (playerId)
                this.addVonageSession(created, playerId).then();
            else
                this.addVonageSession(created).then();
            return created;
        };
        this.addVonageSession = (conversation, playerId) => __awaiter(this, void 0, void 0, function* () {
            const session = yield (0, vonage_1.createSession)();
            conversation.setVonageSessionId(session.sessionId);
            if (conversation instanceof conversation_1.DynamicConversation) {
                conversation.players.forEach((player) => {
                    const token = (0, vonage_1.genTokenToConnectSession)(conversation.vonageSessionId, "publisher");
                    player.socket.emit("updatePlayerVonageSession", {
                        sessionType: conversation_1.ConversationType.dynamic,
                        sessionId: conversation.vonageSessionId,
                        apiKey: process.env.VONAGE_API_KEY,
                        token: token,
                        broadcastRole: player.broadcastRole
                    });
                });
            }
            if (conversation instanceof conversation_1.GlobalBroadcastConversation) {
                const broadcaster = this.getPlayer(playerId);
                broadcaster.broadcastRole = 'publisher';
                let token = (0, vonage_1.genTokenToConnectSession)(conversation.vonageSessionId, "publisher");
                broadcaster.socket.emit("updatePlayerVonageSession", {
                    sessionType: conversation_1.ConversationType.broadcast,
                    sessionId: conversation.vonageSessionId,
                    apiKey: process.env.VONAGE_API_KEY,
                    token: token,
                    broadcastRole: broadcaster.broadcastRole
                });
                this.players.forEach((player) => {
                    if (player.id !== broadcaster.id) {
                        player.broadcastRole = "subscriber";
                        token = (0, vonage_1.genTokenToConnectSession)(conversation.vonageSessionId, "subscriber");
                        player.socket.emit("updatePlayerVonageSession", {
                            sessionType: conversation_1.ConversationType.broadcast,
                            sessionId: conversation.vonageSessionId,
                            apiKey: process.env.VONAGE_API_KEY,
                            token: token,
                            broadcastRole: player.broadcastRole
                        });
                    }
                });
            }
            this.conversations.set(conversation.id, conversation);
        });
        this.removeConversation = (id) => {
            const conversation = this.conversations.get(id);
            if (conversation) {
                this.conversations.delete(id);
            }
            return conversation;
        };
        this.getCurrentMap = () => {
            return this.map;
        };
        this.setCurrentMap = (map) => {
            this.map = map;
            return this.map;
        };
        this.createInviteLink = (spaceId) => __awaiter(this, void 0, void 0, function* () {
            const uuid = jose.base64url.encode(yield this.recordNewUuid(spaceId));
            let port = process.env.PORT = "";
            if (process.env.NODE_ENV === "development") {
                port = "3000";
            }
            this.inviteLink = `${process.env.URL}:${port}/login/invite?token=${uuid}`;
            //TODO: Шо делать с портом фронта?
            return this.inviteLink;
        });
        this.recordNewUuid = (spaceId) => __awaiter(this, void 0, void 0, function* () {
            let existingUuid = yield this.getUuidFromDb(spaceId);
            if (existingUuid === null) {
                const model = yield inviteTable_1.InviteTable.create({ spaceId: spaceId });
                existingUuid = model.getDataValue('uuid');
            }
            return existingUuid;
        });
        this.getUuidFromDb = (spaceId) => __awaiter(this, void 0, void 0, function* () {
            const inviteInstance = yield inviteTable_1.InviteTable.findOne({
                where: {
                    spaceId: spaceId
                }
            });
            if (inviteInstance === null)
                return null;
            return inviteInstance.getDataValue("uuid");
        });
        this.addPoll = (poll, playerId) => {
            console.log("addPoll_SPACE: " + poll.id);
            const existing = this.polls.get(poll.id);
            if (existing) {
                return new Error("poll already exist");
            }
            const player = this.getPlayer(playerId);
            const conversation = this.conversations.get(player.currentConversationId);
            conversation.setCurrentPollId(poll.id);
            this.polls.set(poll.id, poll);
            console.log("polls: " + this.polls);
            return poll;
        };
        this.removePoll = (id, playerId) => {
            const poll = this.polls.get(id);
            if (poll) {
                this.polls.delete(id);
                const player = this.getPlayer(playerId);
                const conversation = this.conversations.get(player.currentConversationId);
                conversation.setCurrentPollId(null);
            }
            return poll;
        };
        this.getPoll = (pollId) => {
            return this.polls.get(pollId);
        };
        this.listPolls = () => {
            const list = new Array();
            list.push(...this.polls.values());
            return list;
        };
        this.spaceId = id;
        this.players = new Map();
        this.conversations = new Map();
        this.polls = new Map();
    }
    ;
}
class Memory {
    constructor() {
        this.spaces = new Map();
        this.tileMaps = new Map();
        this.getPlayer = (spaceId, id) => {
            const space = this.spaces.get(spaceId);
            return space ? space.getPlayer(id) : undefined;
        };
        this.updatePlayerPosition = (spaceId, id, position) => {
            const space = this.spaces.get(spaceId);
            return space ? space.updatePlayerPosition(id, position) : undefined;
        };
        this.addPlayer = (spaceId, player, mapName) => __awaiter(this, void 0, void 0, function* () {
            if (!this.spaces.has(spaceId)) {
                this.spaces.set(spaceId, new Space(spaceId));
                this.addTileMap(spaceId, "demo_map2");
                console.log(yield this.createInviteLink(spaceId));
            }
            const space = this.spaces.get(spaceId);
            return space.addPlayer(player);
        });
        this.removePlayer = (spaceId, playerId) => {
            const space = this.spaces.get(spaceId);
            return space ? space.removePlayer(playerId) : undefined;
        };
        this.listPlayers = (spaceId) => {
            const space = this.spaces.get(spaceId);
            return space ? space.listPlayers() : undefined;
        };
        this.listPlayersInfo = (spaceId) => {
            const list = this.listPlayers(spaceId);
            return list ? list.map((v) => v.info()) : undefined;
        };
        this.getConversation = (spaceId, id) => {
            const space = this.spaces.get(spaceId);
            return space ? space.getConversation(id) : undefined;
        };
        this.addConversation = (spaceId, id, type, playerId) => {
            const space = this.spaces.get(spaceId);
            return space ? space.addConversation(id, type, playerId) : undefined;
        };
        this.removeConversation = (spaceId, id) => {
            const space = this.spaces.get(spaceId);
            return space ? space.removeConversation(id) : undefined;
        };
        this.getTileMap = (mapName) => {
            return this.tileMaps.get(mapName);
        };
        this.getTileMapBySpaceId = (spaceId) => {
            const space = this.spaces.get(spaceId);
            const currentMap = space.getCurrentMap();
            return this.getTileMap(currentMap.name);
        };
        this.addTileMap = (spaceId, mapName) => {
            const existingMap = this.tileMaps.get(mapName);
            const space = this.spaces.get(spaceId);
            if (existingMap) {
                space.setCurrentMap(existingMap);
                return existingMap;
            }
            const unparsedMap = fs_1.default.readFileSync(`${__dirname}/../../resources/tileMaps/${mapName}/${mapName}.json`, "utf8");
            const parsedMap = JSON.parse(unparsedMap);
            const tileMap = new map_1.TileMap(mapName, parsedMap);
            space.setCurrentMap(tileMap);
            const tileConversations = tileMap.getConversations();
            tileConversations.forEach((tileConversation) => {
                this.addConversation(spaceId, tileConversation.id, tileConversation.type);
            });
            this.tileMaps.set(mapName, tileMap);
            return tileMap;
        };
        this.removeTileMap = (mapName) => {
            const tileMap = this.tileMaps.get(mapName);
            if (tileMap) {
                this.tileMaps.delete(mapName);
            }
            return tileMap;
        };
        this.createInviteLink = (spaceId) => __awaiter(this, void 0, void 0, function* () {
            const space = this.spaces.get(spaceId);
            return yield space.createInviteLink(spaceId);
        });
        this.addPoll = (spaceId, playerId, poll) => {
            console.log("addPoll_MEMORY " + poll.answers);
            const space = this.spaces.get(spaceId);
            return space.addPoll(poll, playerId);
        };
        this.removePoll = (spaceId, pollId, playerId) => {
            const space = this.spaces.get(spaceId);
            return space ? space.removePoll(pollId, playerId) : undefined;
        };
        this.getPoll = (spaceId, pollId) => {
            const space = this.spaces.get(spaceId);
            return space ? space.getPoll(pollId) : undefined;
        };
        this.listPolls = (spaceId) => {
            const space = this.spaces.get(spaceId);
            return space ? space.listPolls() : undefined;
        };
    }
}
exports.db = new Memory();
//# sourceMappingURL=memory.js.map