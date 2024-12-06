"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteTable = void 0;
const database_1 = require("../../config/database");
const sequelize_1 = require("sequelize");
exports.InviteTable = database_1.sequelize.define("inviteTable", {
    uuid: {
        primaryKey: true,
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    spaceId: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
    }
}, {
    tableName: "inviteTables"
});
//# sourceMappingURL=inviteTable.js.map