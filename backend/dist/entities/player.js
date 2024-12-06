"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = exports.Player = exports.PlayerInfo = void 0;
class PlayerInfo {
    constructor(id, name, skinId) {
        this.position = new Position();
        this.id = id;
        this.name = name;
        this.skinId = skinId;
    }
    ;
}
exports.PlayerInfo = PlayerInfo;
class Player extends PlayerInfo {
    constructor(socket, id, name, skinId) {
        super(id, name, skinId);
        this.info = () => {
            return {
                id: this.id,
                name: this.name,
                skinId: this.skinId,
                position: this.position
            };
        };
        this.socket = socket;
    }
    ;
}
exports.Player = Player;
class Position {
    constructor() {
        this.x = 1440;
        this.y = 2630;
        this.animFrame = 0;
    }
}
exports.Position = Position;
//# sourceMappingURL=player.js.map