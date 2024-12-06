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
exports.passportSocket = exports.passportJwt = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const user_1 = require("../models/postgres/user");
const containers_1 = require("../containers");
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.EC_PUBLIC_KEY,
    algorithms: ["ES256"],
    passReqToCallback: true
};
//TODO вынести логику из конфига
exports.passportJwt = passport_1.default.use("jwt", new passport_jwt_1.Strategy(jwtOptions, (req, jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userOrGuestId = JSON.parse(jwtPayload.sub.toString()).id;
        const user = yield user_1.User.findOne({
            where: {
                id: userOrGuestId
            }
        });
        const player = containers_1.players.get(userOrGuestId);
        if (user) {
            return done(null, user);
        }
        else if (player) {
            return done(null, player);
        }
        else {
            return done(null, false, { message: "user not found" });
        }
    }
    catch (error) {
        console.log(error);
        return done(error, false);
    }
})));
//# sourceMappingURL=passport.js.map