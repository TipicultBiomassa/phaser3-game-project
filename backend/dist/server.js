"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const method_override_1 = __importDefault(require("method-override"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const cors_1 = __importDefault(require("cors"));
// import passport from "passport";
const router_1 = require("./api_routes/router");
// import {socketAuthentication} from "./middlewares/authentication";
const connection_1 = __importDefault(require("src/controllers/socket/connection"));
const database_1 = require("./config/database");
const vonage_1 = __importDefault(require("src/controllers/socket/vonage"));
const app = (0, express_1.default)();
const server = new http_1.Server(app);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, method_override_1.default)("_method"));
// app.use(passport.initialize());
app.use(router_1.router);
let corsSettings = {};
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
    corsSettings = {
        origin: "*",
        allowedHeaders: "*"
    };
}
else {
    const frontBuildPath = path_1.default.join(__dirname, "..", "..", "frontend", "build");
    app.use(express_1.default.static(frontBuildPath));
    app.get("*", (req, res) => {
        res.sendFile(path_1.default.join(frontBuildPath, "index.html"));
    });
}
const io = new socket_io_1.default.Server(server, { cors: corsSettings });
// socketAuthentication(io);
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, connection_1.default)(io, socket);
    yield (0, vonage_1.default)(io, socket);
}));
const port = Number(process.env.PORT) || 2000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.sequelize.authenticate();
        yield database_1.sequelize.sync();
        server.listen(port);
        return new Promise((resolve) => { resolve(server); });
    }
    catch (error) {
        return new Promise((_resolve, reject) => { reject(error); });
    }
});
startServer().then((server) => {
    const addressInfo = server.address();
    const port = addressInfo.port;
    console.log(`Listening on ${port}`);
}, (error) => {
    console.log(error);
});
//# sourceMappingURL=server.js.map