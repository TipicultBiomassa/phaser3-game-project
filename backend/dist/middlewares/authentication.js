"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const passport_1 = require("../config/passport");
const dotenv_1 = require("dotenv");
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
}
const authentication = (req, res, next) => {
    passport_1.passportJwt.authenticate("jwt", { session: false }, (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            throw new Error("user not found");
        }
        req.user = user;
        return next();
    })(req, res, next);
};
exports.authentication = authentication;
// export const socketAuthentication = (io: Server): void => {
//     const socketJwt: passportSocketIoTs = new passportSocketIoTs();
//     const jwtOptions: StrategyOptions = {
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         secretOrKey: process.env.EC_PUBLIC_KEY,
//         algorithms: ["ES256"]
//     };
//
//     io.use(socketJwt.authorize(
//         jwtOptions,
//         async (jwtPayload, done) => {
//             try {
//                 const userInfo: UserAttributes | Player = JSON.parse(jwtPayload.sub.toString());
//                 const userOrGuestId: string | number = userInfo.id;
//                 let user: Model<UserAttributes, UserCreationAttributes> | null;
//
//                 if (isNaN(Number(userOrGuestId)) === false) {
//                     user = await User.findOne({
//                         where: {
//                             id: userOrGuestId
//                         }
//                     });
//                 }
//                 const player: Player = players.get(userOrGuestId as string);
//                 console.log(player);
//
//                 if (user) {
//                     const exUserInfo: UserAttributes = userInfo as UserAttributes;
//                     const refreshToken: string = exUserInfo.refreshToken;
//
//                     if (refreshToken === undefined) {
//                         return done(null, false, {message: "authorization required"});
//                     }
//
//                     await verifyToken(refreshToken);
//                     if (bcrypt.compareSync(refreshToken, user.getDataValue("refreshToken")) === false) {
//                         return done(null, false, {message: "authorization required"});
//                     }
//
//                     return done(null, user);
//                 } else if (player) {
//                     return done(null, player);
//                 } else {
//                     return done(null, false, {message: "User not found"});
//                 }
//             } catch (error) {
//                 console.log(error);
//                 return done(error, false);
//             }
//         },
//         (error: any) => {
//             if (error) {
//                 console.log(error);
//             }
//         }
//     ));
// };
//# sourceMappingURL=authentication.js.map