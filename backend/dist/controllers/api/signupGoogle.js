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
exports.signupGoogle = void 0;
const signupGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authInfo = req.authInfo;
        const user = req.user;
        const userInfo = user.toJSON();
        userInfo.email = userInfo.email.toLowerCase();
        res.cookie("refreshToken", userInfo.refreshToken, {
            httpOnly: true,
            path: "/user/refresh_token",
            maxAge: 10 * 24 * 60 * 60 * 1000
        });
        return res.status(authInfo.statusCode).json({
            accessToken: authInfo.accessToken,
            data: {
                user
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.signupGoogle = signupGoogle;
//# sourceMappingURL=signupGoogle.js.map