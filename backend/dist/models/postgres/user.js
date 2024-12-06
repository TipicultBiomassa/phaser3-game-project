"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const database_1 = require("../../config/database");
const sequelize_1 = require("sequelize");
exports.User = database_1.sequelize.define("user", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    googleId: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: "invalid email" } }
    },
    password: {
        type: sequelize_1.DataTypes.STRING
    },
    refreshToken: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "user"
    }
}, {
    tableName: "users"
});
//# sourceMappingURL=user.js.map