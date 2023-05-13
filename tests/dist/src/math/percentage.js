"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Percentage = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Percentage - the util set for percentage struct.
 */
class Percentage {
    constructor(numerator, denominator) {
        this.toString = () => {
            return `${this.numerator.toString()}/${this.denominator.toString()}`;
        };
        this.numerator = numerator;
        this.denominator = denominator;
    }
    /**
     * Get the percentage of a number.
     *
     * @param number
     * @returns
     */
    static fromDecimal(number) {
        return Percentage.fromFraction(number.toDecimalPlaces(1).mul(10).toNumber(), 1000);
    }
    /**
     * Get the percentage of a fraction.
     *
     * @param numerator
     * @param denominator
     * @returns
     */
    static fromFraction(numerator, denominator) {
        const num = typeof numerator === 'number' ? new bn_js_1.default(numerator.toString()) : numerator;
        const denom = typeof denominator === 'number' ? new bn_js_1.default(denominator.toString()) : denominator;
        return new Percentage(num, denom);
    }
}
exports.Percentage = Percentage;
