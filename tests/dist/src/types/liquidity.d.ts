import BN from 'bn.js';
export declare type DecreaseLiquidityInput = {
    tokenMinA: BN;
    tokenMinB: BN;
    liquidityAmount: BN;
};
export declare type IncreaseLiquidityInput = {
    tokenMaxA: BN;
    tokenMaxB: BN;
    liquidityAmount: BN;
};
export declare enum SwapDirection {
    A2B = "a2b",
    B2A = "b2a"
}
