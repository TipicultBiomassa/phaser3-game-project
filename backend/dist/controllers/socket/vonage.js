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
Object.defineProperty(exports, "__esModule", { value: true });
const vonage_1 = require("src/controllers/socket/utils/vonage");
const registerVonageController = (io, socket) => {
    const vonageInitialize = () => __awaiter(void 0, void 0, void 0, function* () {
        const session = yield (0, vonage_1.createSession)();
        const token = (0, vonage_1.genTokenToConnectSession)(session.sessionId, "publisher");
        socket.emit("generatedVonageToken", {
            sessionId: session.sessionId,
            apiKey: process.env.VONAGE_API_KEY,
            token: token
        });
    });
    socket.on("initializeVonage", vonageInitialize);
};
exports.default = registerVonageController;
//# sourceMappingURL=vonage.js.map