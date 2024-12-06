"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = require("dotenv");
let dialectOptions = {};
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
}
if (process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "database") {
    dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    };
}
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    dialectOptions: dialectOptions
});
//# sourceMappingURL=database.js.map