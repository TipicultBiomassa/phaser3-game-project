"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClosePollListener = exports.createAddPollListener = void 0;
const poll_1 = require("../../../entities/poll");
const memory_1 = require("../../../db/memory");
let pollId = 0;
const createAddPollListener = (spaceId, playerId) => {
    return (pollInfo, errorCallBack) => {
        console.log("createAddPollListener: " + pollInfo.title + " " + pollInfo.question + " " + pollInfo.answers);
        // console.log("pollId: "+db.listPolls(spaceId).length);
        // pollId = db.listPolls(spaceId).length;
        console.log("pollId: " + pollId);
        const listPlayer = memory_1.db.listPlayers(spaceId);
        const pollCreator = memory_1.db.getPlayer(spaceId, playerId);
        console.log("pollCreator: " + pollCreator);
        const createdPoll = memory_1.db.addPoll(spaceId, playerId, new poll_1.Poll(pollId, pollInfo, pollCreator));
        pollId++;
        console.log("addPoll has been worked");
        if (createdPoll instanceof Error) {
            return errorCallBack(createdPoll.message);
        }
        listPlayer.forEach((player) => {
            if (pollCreator.currentConversationId === player.currentConversationId) {
                if (pollCreator.id !== player.id) {
                    pollCreator.socket.to(player.id).emit("addPoll", pollInfo);
                }
            }
        });
    };
};
exports.createAddPollListener = createAddPollListener;
const createClosePollListener = (spaceId, playerId) => {
    return () => {
        const listPlayer = memory_1.db.listPlayers(spaceId);
        const pollCreator = memory_1.db.getPlayer(spaceId, playerId);
        const conversation = memory_1.db.getConversation(spaceId, pollCreator.currentConversationId);
        const results = memory_1.db.getPoll(spaceId, conversation.getCurrentPollId()).getVotes();
        listPlayer.forEach((player) => {
            if (pollCreator.currentConversationId === player.currentConversationId) {
                pollCreator.socket.to(player.id).emit("closePoll", results);
            }
        });
    };
};
exports.createClosePollListener = createClosePollListener;
//# sourceMappingURL=poll.js.map