"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtil = exports.U128_MAX = exports.U64_MAX = exports.U128 = exports.TWO = exports.ONE = exports.ZERO = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const decimal_1 = __importDefault(require("../utils/decimal"));
// eslint-disable-next-line import/no-unresolved
const errors_1 = require("../errors/errors");
exports.ZERO = new bn_js_1.default(0);
exports.ONE = new bn_js_1.default(1);
exports.TWO = new bn_js_1.default(2);
exports.U128 = exports.TWO.pow(new bn_js_1.default(128));
exports.U64_MAX = exports.TWO.pow(new bn_js_1.default(64)).sub(exports.ONE);
exports.U128_MAX = exports.TWO.pow(new bn_js_1.default(128)).sub(exports.ONE);
/**
 * @category MathUtil
 */
class MathUtil {
    static toX64_BN(num) {
        return num.mul(new bn_js_1.default(2).pow(new bn_js_1.default(64)));
    }
    static toX64_Decimal(num) {
        return num.mul(decimal_1.default.pow(2, 64));
    }
    static toX64(num) {
        return new bn_js_1.default(num.mul(decimal_1.default.pow(2, 64)).floor().toFixed());
    }
    static fromX64(num) {
        return new decimal_1.default(num.toString()).mul(decimal_1.default.pow(2, -64));
    }
    static fromX64_Decimal(num) {
        return num.mul(decimal_1.default.pow(2, -64));
    }
    static fromX64_BN(num) {
        return num.div(new bn_js_1.default(2).pow(new bn_js_1.default(64)));
    }
    static shiftRightRoundUp(n) {
        let result = n.shrn(64);
        if (n.mod(exports.U64_MAX).gt(exports.ZERO)) {
            result = result.add(exports.ONE);
        }
        return result;
    }
    static divRoundUp(n0, n1) {
        const hasRemainder = !n0.mod(n1).eq(exports.ZERO);
        if (hasRemainder) {
            return n0.div(n1).add(new bn_js_1.default(1));
        }
        return n0.div(n1);
    }
    static subUnderflowU128(n0, n1) {
        if (n0.lt(n1)) {
            return n0.sub(n1).add(exports.U128_MAX);
        }
        return n0.sub(n1);
    }
    static checkUnsignedSub(n0, n1) {
        const n = n0.sub(n1);
        if (n.isNeg()) {
            throw new errors_1.ClmmpoolsError('Unsigned integer sub overflow', errors_1.MathErrorCode.UnsignedIntegerOverflow);
        }
        return n;
    }
    static checkMul(n0, n1, limit) {
        const n = n0.mul(n1);
        if (this.isOverflow(n, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication overflow', errors_1.MathErrorCode.MulOverflow);
        }
        return n;
    }
    static checkMulDivFloor(n0, n1, denom, limit) {
        if (denom.eq(exports.ZERO)) {
            throw new errors_1.ClmmpoolsError('Devide by zero', errors_1.MathErrorCode.DivideByZero);
        }
        const n = n0.mul(n1).div(denom);
        if (this.isOverflow(n, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication div overflow', errors_1.MathErrorCode.MulDivOverflow);
        }
        return n;
    }
    static checkMulDivCeil(n0, n1, denom, limit) {
        if (denom.eq(exports.ZERO)) {
            throw new errors_1.ClmmpoolsError('Devide by zero', errors_1.MathErrorCode.DivideByZero);
        }
        const n = n0.mul(n1).add(denom.sub(exports.ONE)).div(denom);
        if (this.isOverflow(n, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication div overflow', errors_1.MathErrorCode.MulDivOverflow);
        }
        return n;
    }
    static checkMulDivRound(n0, n1, denom, limit) {
        if (denom.eq(exports.ZERO)) {
            throw new errors_1.ClmmpoolsError('Devide by zero', errors_1.MathErrorCode.DivideByZero);
        }
        const n = n0.mul(n1.add(denom.shrn(1))).div(denom);
        if (this.isOverflow(n, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication div overflow', errors_1.MathErrorCode.MulDivOverflow);
        }
        return n;
    }
    static checkMulShiftRight(n0, n1, shift, limit) {
        const n = n0.mul(n1).div(new bn_js_1.default(2).pow(new bn_js_1.default(shift)));
        // const n = n0.mul(n1).shrn(shift)
        if (this.isOverflow(n, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication shift right overflow', errors_1.MathErrorCode.MulShiftRightOverflow);
        }
        return n;
    }
    static checkMulShiftRight64RoundUpIf(n0, n1, limit, roundUp) {
        const p = n0.mul(n1);
        const shoudRoundUp = roundUp && p.and(exports.U64_MAX).gt(exports.ZERO);
        const result = shoudRoundUp ? p.shrn(64).add(exports.ONE) : p.shrn(64);
        if (this.isOverflow(result, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication shift right overflow', errors_1.MathErrorCode.MulShiftRightOverflow);
        }
        return result;
    }
    static checkMulShiftLeft(n0, n1, shift, limit) {
        const n = n0.mul(n1).shln(shift);
        if (this.isOverflow(n, limit)) {
            throw new errors_1.ClmmpoolsError('Multiplication shift left overflow', errors_1.MathErrorCode.MulShiftLeftOverflow);
        }
        return n;
    }
    static checkDivRoundUpIf(n0, n1, roundUp) {
        if (n1.eq(exports.ZERO)) {
            throw new errors_1.ClmmpoolsError('Devide by zero', errors_1.MathErrorCode.DivideByZero);
        }
        if (roundUp) {
            return this.divRoundUp(n0, n1);
        }
        return n0.div(n1);
    }
    static isOverflow(n, bit) {
        return n.gte(exports.TWO.pow(new bn_js_1.default(bit)));
    }
}
exports.MathUtil = MathUtil;
