"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const login_1 = require("../controllers/api/login");
exports.router = (0, express_1.Router)();
exports.router.post("/login/connect", login_1.connectToSpace);
exports.router.post("/login/invite", login_1.connectToInvitedSpace);
// router.post("/auth/signup", signup);
// router.post("/auth/login", login);
// router.get("/auth/email/confirmation", activateEmail);
// //TODO вынести логику гугла в контроллеры
// router.get(
//     "/auth/google",
//     passportGoogle.authenticate(
//         "google",
//         {
//             session: false,
//             scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
//             accessType: "offline",
//             prompt: "consent"
//         }
//     )
// );
//
// router.get(
//     "/auth/google/callback",
//     passportGoogle.authenticate(
//         "google",
//         {
//             session: false,
//             scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
//         }
//     ),
//     signupGoogle
// );
//# sourceMappingURL=router.js.map