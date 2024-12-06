"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicConversation = exports.GlobalBroadcastConversation = exports.BroadcastConversation = exports.NearbyConversation = exports.StaticConversation = exports.Conversation = exports.ConversationType = void 0;
var ConversationType;
(function (ConversationType) {
    ConversationType["nearby"] = "nearby";
    ConversationType["dynamic"] = "dynamic";
    ConversationType["broadcast"] = "broadcast";
})(ConversationType = exports.ConversationType || (exports.ConversationType = {}));
var CoordName;
(function (CoordName) {
    CoordName["x1"] = "x1";
    CoordName["y1"] = "y1";
    CoordName["x2"] = "x2";
    CoordName["y2"] = "y2";
})(CoordName || (CoordName = {}));
class Area {
}
class Conversation {
    constructor(id) {
        this.getVonageSessionId = () => {
            return this.vonageSessionId;
        };
        this.setVonageSessionId = (id) => {
            this.vonageSessionId = id;
            return this.vonageSessionId;
        };
        this.id = id;
        this.vonageSessionId = null;
        this.currentPollId = null;
    }
    ;
    getCurrentPollId() {
        return this.currentPollId;
    }
    ;
    setCurrentPollId(id) {
        this.currentPollId = id;
        return this.currentPollId;
    }
    ;
}
exports.Conversation = Conversation;
class StaticConversation extends Conversation {
    constructor(id) {
        super(id);
    }
    ;
}
exports.StaticConversation = StaticConversation;
class NearbyConversation extends StaticConversation {
    constructor(id) {
        super(id);
    }
}
exports.NearbyConversation = NearbyConversation;
class BroadcastConversation extends StaticConversation {
    constructor(id) {
        super(id);
    }
    ;
}
exports.BroadcastConversation = BroadcastConversation;
class GlobalBroadcastConversation extends BroadcastConversation {
    constructor(id) {
        super(id);
    }
}
exports.GlobalBroadcastConversation = GlobalBroadcastConversation;
class DynamicConversation extends Conversation {
    constructor(id, players) {
        super(id);
        this.isInByCoords = (x, y) => {
            return x >= this.area.x1 && x <= this.area.x2 && y <= this.area.y1 && y >= this.area.y2;
        };
        this.isInByPlayerId = (id) => {
            return this.players.has(id);
        };
        this.addPlayer = (id, player) => {
            console.log(this.id, player.name);
            this.players.set(id, player);
            this.updateArea();
        };
        this.removePlayer = (id) => {
            this.players.delete(id);
            this.updateArea();
        };
        this.updatePlayerPosition = (id, player) => {
            this.players.set(id, player);
            this.updateArea();
        };
        this.updateArea = () => {
            let x1 = 999999999;
            let y1 = 0;
            let x2 = 0;
            let y2 = 999999999;
            let extremePositions = new Map();
            this.players.forEach((player) => {
                player.socket.emit("area", this.area);
                if (player.position.x < x1) {
                    x1 = player.position.x;
                    extremePositions.set(CoordName.x1, player.position);
                }
                if (player.position.y > y1) {
                    y1 = player.position.y;
                    extremePositions.set(CoordName.y1, player.position);
                }
                if (player.position.x > x2) {
                    x2 = player.position.x;
                    extremePositions.set(CoordName.x2, player.position);
                }
                if (player.position.y < y2) {
                    y2 = player.position.y;
                    extremePositions.set(CoordName.y2, player.position);
                }
            });
            extremePositions.forEach((pos, coordName) => {
                let playerCounter = 0;
                let scale = false;
                if (this.players.size > 1) {
                    this.players.forEach((player) => {
                        if (Math.sqrt(Math.pow((pos.x - player.position.x), 2)) +
                            Math.sqrt(Math.pow((pos.y - player.position.y), 2)) > 50) {
                            return;
                        }
                        if (playerCounter >= this.players.size / 3) {
                            scale = true;
                            return;
                        }
                        playerCounter++;
                    });
                }
                else {
                    scale = true;
                }
                if (scale) {
                    if (coordName === CoordName.x1)
                        this.area.x1 = x1 - 50;
                    if (coordName === CoordName.y1)
                        this.area.y1 = y1 + 50;
                    if (coordName === CoordName.x2)
                        this.area.x2 = x2 + 50;
                    if (coordName === CoordName.y2)
                        this.area.y2 = y2 - 50;
                }
            });
        };
        this.players = players;
        this.area = new Area();
        this.updateArea();
    }
    ;
}
exports.DynamicConversation = DynamicConversation;
//# sourceMappingURL=conversation.js.map