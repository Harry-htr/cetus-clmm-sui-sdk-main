import BN from 'bn.js';
import Decimal from 'decimal.js';
export declare function estPoolAPR(preBlockReward: BN, rewardPrice: BN, totalTradingFee: BN, totalLiquidityValue: BN): BN;
export type estPosAPRResult = {
    feeAPR: Decimal;
    posRewarder0APR: Decimal;
    posRewarder1APR: Decimal;
    posRewarder2APR: Decimal;
};
export declare function estPositionAPRWithDeltaMethod(currentTickIndex: number, lowerTickIndex: number, upperTickIndex: number, currentSqrtPriceX64: BN, poolLiquidity: BN, decimalsA: number, decimalsB: number, decimalsRewarder0: number, decimalsRewarder1: number, decimalsRewarder2: number, feeRate: number, amountA_str: string, amountB_str: string, poolAmountA: BN, poolAmountB: BN, swapVolume_str: string, poolRewarders0_str: string, poolRewarders1_str: string, poolRewarders2_str: string, coinAPrice_str: string, coinBPrice_str: string, rewarder0Price_str: string, rewarder1Price_str: string, rewarder2Price_str: string): estPosAPRResult;
export declare function estPositionAPRWithMultiMethod(lowerUserPrice: number, upperUserPrice: number, lowerHistPrice: number, upperHistPrice: number): Decimal;
