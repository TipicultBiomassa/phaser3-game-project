"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const containers_1 = require("../containers");
const verifyAdmin = (socket, next) => {
    if (isAdmin(socket.id)) {
        next();
    }
    else {
        next("you are not an admin");
    }
};
exports.verifyAdmin = verifyAdmin;
const isAdmin = (playerId) => {
    const foundPlayerInfo = containers_1.players.get(playerId);
    if (foundPlayerInfo && foundPlayerInfo.role) {
        return foundPlayerInfo.role === "spaceAdmin" /* spaceAdmin */;
    }
    return false;
};
//# sourceMappingURL=verifyAdmin.js.map