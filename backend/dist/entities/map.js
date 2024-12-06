"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileMap = exports.ConversationTileType = void 0;
var ConversationTileType;
(function (ConversationTileType) {
    ConversationTileType["nearby"] = "nearby";
    ConversationTileType["broadcastViewer"] = "broadcast_viewer";
    ConversationTileType["broadcastPublisher"] = "broadcast_publisher";
})(ConversationTileType = exports.ConversationTileType || (exports.ConversationTileType = {}));
class TileMap {
    constructor(name, map) {
        this.conversationZonesLayerName = "conversationZones";
        this.addConversationZonesLayerIndex = () => {
            try {
                let i = 0;
                this.map.layers.forEach((layer) => {
                    if (layer.name === this.conversationZonesLayerName) {
                        this.conversationZonesLayerIndex = i;
                        return;
                    }
                    i++;
                });
            }
            catch (error) {
                console.log(error);
                return undefined;
            }
        };
        this.getBroadcastRoleByTileId = (tileId) => {
            let broadcastRole = undefined;
            const broadcastConversation = this.conversations.get(tileId);
            if (broadcastConversation.type === ConversationTileType.broadcastPublisher)
                broadcastRole = "publisher";
            if (broadcastConversation.type === ConversationTileType.broadcastViewer)
                broadcastRole = "subscriber";
            return broadcastRole;
        };
        this.getConversationIdAt = (position) => {
            const currentTileId = this.getTileIdAt(position.x, position.y);
            const conversationId = this.conversations.get(currentTileId);
            if (conversationId) {
                return conversationId;
            }
            return undefined;
        };
        this.getTileIdAt = (x, y) => {
            try {
                const tileMapWidth = this.map.width;
                const tileWidth = this.map.tilewidth;
                const tileHeight = this.map.tileheight;
                const zoneLayer = this.map.layers[this.conversationZonesLayerIndex].data;
                const tileX = Math.floor(x / tileWidth);
                const tileY = Math.floor(y / tileHeight);
                return zoneLayer[tileY * tileMapWidth + tileX] - 1;
            }
            catch (error) {
                console.log(error);
                return undefined;
            }
        };
        this.getConversations = () => {
            try {
                if (this.conversationZonesLayerIndex === undefined) {
                    this.addConversationZonesLayerIndex();
                }
                this.map.tilesets.forEach((tileSet) => {
                    tileSet.tiles.forEach((tile) => {
                        tile.properties.forEach((property) => {
                            const type = Object.values(ConversationTileType).find(type => type === property.name);
                            if (type) {
                                this.conversations.set(tile.id, { type: type, id: property.value });
                            }
                        });
                    });
                });
                return this.conversations;
            }
            catch (error) {
                console.log(error);
                return undefined;
            }
        };
        this.name = name;
        this.map = map;
        this.conversations = new Map();
    }
    ;
}
exports.TileMap = TileMap;
//# sourceMappingURL=map.js.map