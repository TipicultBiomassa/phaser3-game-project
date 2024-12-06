"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Position = void 0;
class Position {
    constructor() {
        this.x = 1440;
        this.y = 2630;
        this.animFrame = 0;
    }
}
exports.Position = Position;
class Player {
    constructor(id, socket) {
        this.skinId = 0;
        this.position = new Position();
        this.id = id;
        this.socket = socket;
    }
}
exports.Player = Player;
//# sourceMappingURL=types.js.map