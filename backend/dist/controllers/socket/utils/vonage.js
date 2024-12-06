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
exports.genTokenToConnectSession = exports.createSession = exports.OT = void 0;
const opentok_1 = __importDefault(require("opentok"));
const util_1 = require("util");
const API_KEY = process.env.VONAGE_API_KEY;
const API_SECRET = process.env.VONAGE_API_SECRET;
if (API_KEY === undefined || API_SECRET === undefined) {
    throw new Error("Undefined vonage keys");
}
exports.OT = new opentok_1.default(API_KEY, API_SECRET);
const createSession = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const asyncCreateSession = (0, util_1.promisify)(exports.OT.createSession).bind(exports.OT);
        return yield asyncCreateSession({ mediaMode: "routed" });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createSession = createSession;
const genTokenToConnectSession = (id, role) => {
    try {
        const tokenOptions = {
            role: role
        };
        return exports.OT.generateToken(id, tokenOptions);
    }
    catch (error) {
        console.log(error);
    }
};
exports.genTokenToConnectSession = genTokenToConnectSession;
//# sourceMappingURL=vonage.js.map