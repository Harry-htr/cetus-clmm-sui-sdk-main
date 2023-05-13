import BN from 'bn.js';
import { Pool } from '../modules/resourcesModule';
export type TickData = {
    objectId: string;
    index: number;
    sqrtPrice: BN;
    liquidityNet: BN;
    liquidityGross: BN;
    feeGrowthOutsideA: BN;
    feeGrowthOutsideB: BN;
    rewardersGrowthOutside: BN[];
};
export type Tick = {
    index: Bits;
    sqrt_price: string;
    liquidity_net: Bits;
    liquidity_gross: string;
    fee_growth_outside_a: string;
    fee_growth_outside_b: string;
    rewarders_growth_outside: string[3];
};
export type Bits = {
    bits: string;
};
export type ClmmpoolData = {
    coinA: string;
    coinB: string;
    currentSqrtPrice: BN;
    currentTickIndex: number;
    feeGrowthGlobalA: BN;
    feeGrowthGlobalB: BN;
    feeProtocolCoinA: BN;
    feeProtocolCoinB: BN;
    feeRate: BN;
    liquidity: BN;
    tickIndexes: number[];
    tickSpacing: number;
    ticks: Array<TickData>;
    collection_name: string;
};
export declare function transClmmpoolDataWithoutTicks(pool: Pool): ClmmpoolData;
export declare function newBits(index: number | string): Bits;
