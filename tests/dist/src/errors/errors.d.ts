export declare enum MathErrorCode {
    IntegerDowncastOverflow = "IntegerDowncastOverflow",
    MulOverflow = "MultiplicationOverflow",
    MulDivOverflow = "MulDivOverflow",
    MulShiftRightOverflow = "MulShiftRightOverflow",
    MulShiftLeftOverflow = "MulShiftLeftOverflow",
    DivideByZero = "DivideByZero",
    UnsignedIntegerOverflow = "UnsignedIntegerOverflow"
}
export declare enum CoinErrorCode {
    CoinAmountMaxExceeded = "CoinAmountMaxExceeded",
    CoinAmountMinSubceeded = "CoinAmountMinSubceeded ",
    SqrtPriceOutOfBounds = "SqrtPriceOutOfBounds"
}
export declare enum SwapErrorCode {
    InvalidSqrtPriceLimitDirection = "InvalidSqrtPriceLimitDirection",
    SqrtPriceOutOfBounds = "SqrtPriceOutOfBounds",
    ZeroTradableAmount = "ZeroTradableAmount",
    AmountOutBelowMinimum = "AmountOutBelowMinimum",
    AmountInAboveMaximum = "AmountInAboveMaximum",
    NextTickNotFound = "NextTickNoutFound",
    TickArraySequenceInvalid = "TickArraySequenceInvalid",
    TickArrayCrossingAboveMax = "TickArrayCrossingAboveMax",
    TickArrayIndexNotInitialized = "TickArrayIndexNotInitialized"
}
export declare enum PoolErrorCode {
    InvalidCoinTypeSequence = "InvalidCoinTypeSequence"
}
export type ClmmpoolsErrorCode = MathErrorCode | SwapErrorCode | CoinErrorCode | PoolErrorCode;
export declare class ClmmpoolsError extends Error {
    message: string;
    errorCode?: ClmmpoolsErrorCode;
    constructor(message: string, errorCode?: ClmmpoolsErrorCode);
    static isClmmpoolsErrorCode(e: any, code: ClmmpoolsErrorCode): boolean;
}
