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
exports.passportLocalLogin = void 0;
const passport_local_1 = require("passport-local");
const passport_1 = __importDefault(require("passport"));
const user_1 = require("../models/postgres/user");
const userPasswordUtils_1 = require("../utils/userPasswordUtils");
// import {verifyToken} from "../utils/tokens";
const authFields = {
    usernameField: "email",
    session: false,
    passReqToCallback: true
};
exports.passportLocalLogin = passport_1.default.use("login", new passport_local_1.Strategy(authFields, (req, email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (email === undefined || password === undefined) {
            return done(null, false, { message: "invalid email or password" });
        }
        email = email.toLowerCase();
        const user = yield user_1.User.findOne({
            where: {
                email: email
            }
        });
        if (user === null) {
            return done(null, false, { message: "user not found" });
        }
        const passwordMatch = yield (0, userPasswordUtils_1.comparePassword)(user, password);
        if (passwordMatch === false) {
            return done(null, false, { message: "incorrect password" });
        }
        return done(null, user);
    }
    catch (error) {
        console.log(error);
        return done(error, false);
    }
})));
// export const passportLocalSignup: passport.PassportStatic = passport.use(
//     "signup",
//     new Strategy(authFields, async (req, email, password, done) => {
//         try {
//             if (email === undefined || password === undefined) {
//                 return done(null, false, {message: "invalid email or password"});
//             }
//
//             const signupToken: string = req.query.signupToken.toString();
//             const signupInfo: JWTVerifyResult = await verifyToken(signupToken);
//             const newUserInfo: UserAttributes = JSON.parse(signupInfo.payload.sub);
//             newUserInfo.email = newUserInfo.email.toLowerCase();
//             email = email.toLowerCase();
//
//             const existingUser: Model<UserAttributes, UserCreationAttributes> | null = await User.findOne({
//                 where: {
//                     email: email
//                 }
//             });
//             if (existingUser) {
//                 return done(null, false, {message: "email is taken"});
//             }
//
//             const newUser: Model<UserAttributes, UserCreationAttributes> = await User.create(newUserInfo);
//
//             return done(null, newUser);
//         } catch (error) {
//             console.log(error);
//             return done(error, false);
//         }
//     })
// );
//# sourceMappingURL=passportLocal.js.map