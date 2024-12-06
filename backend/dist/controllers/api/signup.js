"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {genSignedToken, verifyToken} from "../../utils/tokens";
const dotenv_1 = require("dotenv");
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
}
// export const signup = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const email: string | undefined = req.body.email;
//         const password: string | undefined = req.body.password;
//
//         if (email === undefined || password === undefined) {
//             return res.status(400).json({message: "invalid email or password"});
//         }
//
//         const foundUser: Model<UserAttributes, UserCreationAttributes> | null = await User.findOne({
//             where: {
//                 email: email
//             }
//         });
//         if (foundUser) {
//             return res.status(400).json({message: "email is taken"});
//         }
//
//         const hashedPassword: string = hashPassword(password);
//         const newUserInfo: UserAttributes = {
//             email: email,
//             password: hashedPassword,
//             googleId: null,
//             refreshToken: null,
//             role: "user"
//         };
//         const activateEmailToken: string = await genSignedToken(newUserInfo,0.25);
//         let url: string;
//         if (process.env.NODE_ENV === "production") {
//             url = `${process.env.URL}/auth/email/confirmation?signupToken=${activateEmailToken}`;
//         } else {
//             url = `${process.env.URL}:${process.env.PORT}/auth/email/confirmation?signupToken=${activateEmailToken}`
//         }
//
//         sendMail({
//             to: email,
//             subject: "Email confirmation",
//             text: url
//         });
//
//         return res.json();
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({message: "internal error"});
//     }
// };
//
// export const activateEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
//     try {
//         const signupToken: string = req.query.signupToken.toString();
//         const signupInfo: JWTVerifyResult = await verifyToken(signupToken);
//         const newUserInfo: UserAttributes = JSON.parse(signupInfo.payload.sub);
//
//         req.body.email = newUserInfo.email.toLowerCase();
//         req.body.password = newUserInfo.password;
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json();
//     }
//
//     passportLocalLogin.authenticate(
//         "signup",
//         {session: false},
//         async (error, user: Express.User, info) => {
//             try {
//                 if (error || !user) {
//                     return res.status(400).json({info});
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
//# sourceMappingURL=signup.js.map