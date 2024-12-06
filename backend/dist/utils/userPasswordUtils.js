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
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = (password) => {
    try {
        const salt = bcrypt_1.default.genSaltSync(10);
        return bcrypt_1.default.hashSync(password, salt);
    }
    catch (error) {
        console.log(error);
    }
};
exports.hashPassword = hashPassword;
const comparePassword = (user, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const correctPassword = user.getDataValue("password");
        return bcrypt_1.default.compare(password, correctPassword);
    }
    catch (error) {
        console.log(error);
    }
});
exports.comparePassword = comparePassword;
//# sourceMappingURL=userPasswordUtils.js.map