"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalBroadcastListener = exports.createVoteListener = exports.createSendPrivateMessageListener = exports.createSendMessageListener = exports.createDisconnectListener = exports.createUpdatePositionListener = void 0;
const memory_1 = require("src/db/memory");
const vonage_1 = require("../utils/vonage");
const conversation_1 = require("src/entities/conversation");
const uuid_1 = require("uuid");
const createUpdatePositionListener = (spaceId, playerId) => {
    return (position) => {
        if (!position) {
            return;
        }
        const [updated, isSessionUpdated] = memory_1.db.updatePlayerPosition(spaceId, playerId, position);
        if (!updated) {
            return;
        }
        if (isSessionUpdated) {
            const conversation = memory_1.db.getConversation(spaceId, updated.currentConversationId);
            if (conversation) {
                if (conversation.vonageSessionId) {
                    const player = memory_1.db.getPlayer(spaceId, playerId);
                    const token = (0, vonage_1.genTokenToConnectSession)(conversation.vonageSessionId, player.broadcastRole);
                    let convType;
                    if (conversation instanceof conversation_1.NearbyConversation)
                        convType = conversation_1.ConversationType.nearby;
                    if (conversation instanceof conversation_1.BroadcastConversation)
                        convType = conversation_1.ConversationType.broadcast;
                    if (conversation instanceof conversation_1.DynamicConversation)
                        convType = conversation_1.ConversationType.dynamic;
                    updated.socket.emit("updatePlayerVonageSession", {
                        sessionType: convType,
                        sessionId: conversation.vonageSessionId,
                        apiKey: process.env.VONAGE_API_KEY,
                        token: token,
                        broadcastRole: player.broadcastRole,
                    });
                }
            }
            else {
                updated.socket.emit("updatePlayerVonageSession");
            }
        }
        updated.socket.to(spaceId).emit("updatePlayerPos", updated.info());
    };
};
exports.createUpdatePositionListener = createUpdatePositionListener;
const createDisconnectListener = (spaceId, playerId) => {
    return () => {
        console.log("createDisconnectListener", spaceId, playerId); // TODO(debug)
        const removed = memory_1.db.removePlayer(spaceId, playerId);
        if (removed) {
            removed.socket.to(spaceId).emit("removeDisconnectedPlayer", removed.info());
        }
    };
};
exports.createDisconnectListener = createDisconnectListener;
const createSendMessageListener = (spaceId, playerId) => {
    return (message) => {
        console.log("createSendMessageListener", spaceId, playerId); // TODO(debug)
        // TODO: trim spaces and some symbols.
        if (!message) {
            return;
        }
        const player = memory_1.db.getPlayer(spaceId, playerId);
        if (!player) {
            return;
        }
        player.socket.to(spaceId).emit("addMessage", player.info(), message);
    };
};
exports.createSendMessageListener = createSendMessageListener;
const createSendPrivateMessageListener = (spaceId, playerId) => {
    return (message, toId) => {
        console.log("createSendPrivateMessageListener", spaceId, playerId); // TODO(debug)
        // TODO: trim spaces and some symbols.
        if (!message) {
            return;
        }
        if (!toId) {
            return;
        }
        const player = memory_1.db.getPlayer(spaceId, playerId);
        if (!player) {
            return;
        }
        player.socket.to(toId).emit("addPrivateMessage", player.info(), message);
    };
};
exports.createSendPrivateMessageListener = createSendPrivateMessageListener;
//Слушать, когда игрок голосует
const createVoteListener = (spaceId, playerId) => {
    return (answerId) => {
        console.log("createAddVoteListener ", answerId);
        const player = memory_1.db.getPlayer(spaceId, playerId);
        const conversation = memory_1.db.getConversation(spaceId, player.currentConversationId);
        const voting = memory_1.db.getPoll(spaceId, conversation.getCurrentPollId());
        voting.addVote(answerId);
        player.socket.to(voting.pollCreator.id).emit("updateVote", answerId);
    };
};
exports.createVoteListener = createVoteListener;
//Listen when player starts global broadcast
const createGlobalBroadcastListener = (spaceId, playerId) => {
    return () => {
        const broadcastCreator = memory_1.db.getPlayer(spaceId, playerId);
        broadcastCreator.broadcastRole = 'publisher';
        memory_1.db.addConversation(spaceId, (0, uuid_1.v4)(), conversation_1.ConversationType.broadcast, broadcastCreator.id);
    };
};
exports.createGlobalBroadcastListener = createGlobalBroadcastListener;
//# sourceMappingURL=player.js.map