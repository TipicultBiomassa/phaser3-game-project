"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.connectToInvitedSpace = exports.connectToSpace = exports.resetPassword = void 0;
const containers_1 = require("../../containers");
const userPasswordUtils_1 = require("../../utils/userPasswordUtils");
const bcrypt_1 = __importDefault(require("bcrypt"));
// import {genSignedToken} from "../../utils/tokens";
const user_1 = require("../../models/postgres/user");
const inviteTable_1 = require("../../models/postgres/inviteTable");
const dotenv_1 = require("dotenv");
const jose = __importStar(require("jose"));
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
}
// export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     passportLocalLogin.authenticate(
//         "login",
//         {session: false},
//         async (error, user, info) => {
//             try {
//                 if (error || !user) {
//                     return res.status(400).json(info);
//                 }
//
//                 const userInfo: UserAttributes = user.toJSON() as UserAttributes;
//                 const accessToken: string = await genSignedToken(userInfo, 1);
//                 const refreshToken: string = await genSignedToken(userInfo, 24 * 10);
//                 const salt: string = bcrypt.genSaltSync(10);
//                 const hashedRefreshToken: string = bcrypt.hashSync(refreshToken, salt);
//                 await user.update("refreshToken", hashedRefreshToken);
//
//                 res.cookie("refreshToken", refreshToken, {
//                     httpOnly: true,
//                     path: "/user/refresh_token",
//                     maxAge: 10 * 24 * 60 * 60 * 1000
//                 });
//
//                 return res.status(201).json({
//                     accessToken,
//                     data: {
//                         user
//                     }
//                 });
//             } catch (error) {
//                 console.log(error);
//             }
//         }
//     )(req, res, next);
// };
//
// export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         if (req.body.email === undefined) {
//             return res.status(400).json({message: "invalid email"});
//         }
//
//         const user: Model<UserAttributes, UserCreationAttributes> | null = await User.findOne({
//             where: {
//                 email: req.body.email
//             }
//         });
//
//         if (user === null) {
//             return res.status(400).json({message: "user not found"});
//         }
//
//         const userInfo: UserAttributes = user.toJSON() as UserAttributes;
//         const resetPasswordToken: string = await genSignedToken(userInfo, 0.25);
//         let url: string;
//         if (process.env.NODE_ENV === "production") {
//             url = `${process.env.URL}/login/reset?resetPasswordToken=${resetPasswordToken}`;
//         } else {
//             url = `${process.env.URL}:${process.env.PORT}/login/reset?resetPasswordToken=${resetPasswordToken}`
//         }
//
//         sendMail({
//             to: req.body.email,
//             subject: "Reset password",
//             text: url
//         });
//
//         return res.json();
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({message: "internal error"});
//     }
// };
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.password === undefined || req.body.user) {
            return res.status(400).json({ message: "invalid password or user" });
        }
        const user = yield user_1.User.findOne({
            where: {
                email: req.body.user.getDataValue("email")
            }
        });
        yield user.update("password", (0, userPasswordUtils_1.hashPassword)(req.body.password));
        res.json();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal error" });
    }
});
exports.resetPassword = resetPassword;
const connectToSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const spaceId = req.body.spaceId;
        const password = req.body.password;
        if (spaceId === undefined || password === undefined) {
            return res.status(400).json({ message: "invalid space id or password" });
        }
        const foundSpaceInfo = containers_1.spaces.get(spaceId);
        if (foundSpaceInfo) {
            const correctPassword = foundSpaceInfo.password;
            const passwordMatch = yield bcrypt_1.default.compare(password, correctPassword);
            if (passwordMatch === false) {
                return res.status(403).json({ message: "wrong password" });
            }
        }
        else {
            const hashedPassword = (0, userPasswordUtils_1.hashPassword)(password);
            containers_1.spaces.set(spaceId, { id: spaceId, password: hashedPassword });
        }
        // let accessToken: string;
        // if (req.cookies && req.cookies.refreshToken) {
        //     accessToken = req.cookies.refreshToken;
        // } else {
        //     const id: string = Math.random().toString(16).substring(2, 16);
        //     players.set(id, {id, spaceId});
        //     accessToken = await genSignedToken({id, spaceId}, 24);
        //     console.log(accessToken);
        // }
        return res.json({
            space: containers_1.spaces.get(spaceId),
            // accessToken: accessToken
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal error" });
    }
});
exports.connectToSpace = connectToSpace;
const connectToInvitedSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uuid = req.body.uuid;
    if (uuid === undefined || uuid === null) {
        return res.status(400).json({ message: "invalid UUID" });
    }
    const spaceId = yield getSpaceIdByUuid(uuid);
    if (!spaceId)
        return res.status(403).json({ message: "space not found" });
    return res.status(200).json({ spaceId: spaceId });
});
exports.connectToInvitedSpace = connectToInvitedSpace;
const getSpaceIdByUuid = (uuid) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUuid = jose.base64url.decode(uuid).toString();
    const invite = yield inviteTable_1.InviteTable.findOne({
        where: {
            uuid: decodedUuid
        }
    });
    if (!invite) {
        return null;
    }
    return invite.getDataValue('spaceId');
});
//# sourceMappingURL=login.js.map