"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = __importDefault(require("decimal.js"));
decimal_js_1.default.config({
    precision: 64,
    rounding: decimal_js_1.default.ROUND_DOWN,
    toExpNeg: -64,
    toExpPos: 64,
});
exports.default = decimal_js_1.default;
