"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClmmpoolsError = exports.PoolErrorCode = exports.SwapErrorCode = exports.CoinErrorCode = exports.MathErrorCode = void 0;
/* eslint-disable no-shadow */
var MathErrorCode;
(function (MathErrorCode) {
    MathErrorCode["IntegerDowncastOverflow"] = "IntegerDowncastOverflow";
    MathErrorCode["MulOverflow"] = "MultiplicationOverflow";
    MathErrorCode["MulDivOverflow"] = "MulDivOverflow";
    MathErrorCode["MulShiftRightOverflow"] = "MulShiftRightOverflow";
    MathErrorCode["MulShiftLeftOverflow"] = "MulShiftLeftOverflow";
    MathErrorCode["DivideByZero"] = "DivideByZero";
    MathErrorCode["UnsignedIntegerOverflow"] = "UnsignedIntegerOverflow";
})(MathErrorCode = exports.MathErrorCode || (exports.MathErrorCode = {}));
var CoinErrorCode;
(function (CoinErrorCode) {
    CoinErrorCode["CoinAmountMaxExceeded"] = "CoinAmountMaxExceeded";
    CoinErrorCode["CoinAmountMinSubceeded"] = "CoinAmountMinSubceeded ";
    CoinErrorCode["SqrtPriceOutOfBounds"] = "SqrtPriceOutOfBounds";
})(CoinErrorCode = exports.CoinErrorCode || (exports.CoinErrorCode = {}));
var SwapErrorCode;
(function (SwapErrorCode) {
    SwapErrorCode["InvalidSqrtPriceLimitDirection"] = "InvalidSqrtPriceLimitDirection";
    SwapErrorCode["SqrtPriceOutOfBounds"] = "SqrtPriceOutOfBounds";
    SwapErrorCode["ZeroTradableAmount"] = "ZeroTradableAmount";
    SwapErrorCode["AmountOutBelowMinimum"] = "AmountOutBelowMinimum";
    SwapErrorCode["AmountInAboveMaximum"] = "AmountInAboveMaximum";
    SwapErrorCode["NextTickNotFound"] = "NextTickNoutFound";
    SwapErrorCode["TickArraySequenceInvalid"] = "TickArraySequenceInvalid";
    SwapErrorCode["TickArrayCrossingAboveMax"] = "TickArrayCrossingAboveMax";
    SwapErrorCode["TickArrayIndexNotInitialized"] = "TickArrayIndexNotInitialized";
})(SwapErrorCode = exports.SwapErrorCode || (exports.SwapErrorCode = {}));
var PoolErrorCode;
(function (PoolErrorCode) {
    PoolErrorCode["InvalidCoinTypeSequence"] = "InvalidCoinTypeSequence";
})(PoolErrorCode = exports.PoolErrorCode || (exports.PoolErrorCode = {}));
class ClmmpoolsError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
    }
    static isClmmpoolsErrorCode(e, code) {
        return e instanceof ClmmpoolsError && e.errorCode === code;
    }
}
exports.ClmmpoolsError = ClmmpoolsError;
