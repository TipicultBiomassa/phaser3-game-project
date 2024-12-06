"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
if (process.env.NODE_ENV !== "production") {
    (0, dotenv_1.config)();
}
const sendMail = (mailOptions) => {
    const transporter = nodemailer_1.default.createTransport({
        service: process.env.EMAIL_SERVICE,
        secure: true,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    mailOptions = Object.assign(Object.assign({}, mailOptions), { from: `Confirmation <${process.env.EMAIL_ADDRESS}>` });
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    });
};
exports.sendMail = sendMail;
//# sourceMappingURL=mailSender.js.map