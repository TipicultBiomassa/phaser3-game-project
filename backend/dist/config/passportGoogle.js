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
exports.passportGoogle = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_1 = require("../models/postgres/user");
const dotenv_1 = require("dotenv");
const bcrypt_1 = __importDefault(require("bcrypt"));
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
}
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const authFields = {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.URL}:2000/auth/google/callback`,
};
exports.passportGoogle = passport_1.default.use("google", new passport_google_oauth20_1.Strategy(authFields, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = yield user_1.User.findOne({
            where: {
                googleId: profile.id
            }
        });
        if (currentUser) {
            return done(null, currentUser, { accessToken, statusCode: 200 });
        }
        const email = profile.emails[0].value.toLowerCase();
        const registeredUser = yield user_1.User.findOne({
            where: {
                email: email
            }
        });
        if (registeredUser) {
            yield registeredUser.update({ googleId: profile.id }, { validate: false });
            return done(null, registeredUser, { accessToken, statusCode: 200 });
        }
        const salt = bcrypt_1.default.genSaltSync(10);
        const hashedRefreshToken = bcrypt_1.default.hashSync(refreshToken, salt);
        const newUserInfo = {
            googleId: profile.id,
            email: email,
            password: null,
            refreshToken: hashedRefreshToken,
            role: "user"
        };
        const newUser = yield user_1.User.create(newUserInfo, {
            validate: false
        });
        return done(null, newUser, { accessToken, statusCode: 201 });
    }
    catch (error) {
        console.log(error);
        return done(error, null);
    }
})));
//# sourceMappingURL=passportGoogle.js.map