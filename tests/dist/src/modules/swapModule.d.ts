import BN from 'bn.js';
import { TransactionBlock } from '@mysten/sui.js';
import { Percentage } from '../math';
import { SuiObjectIdType } from '../types/sui';
import { TickData } from '../types/clmmpool';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { CoinPairType, Pool } from './resourcesModule';
export declare const AMM_SWAP_MODULE = "amm_swap";
export declare const POOL_STRUCT = "Pool";
export type createTestTransferTxPayloadParams = {
    account: string;
    value: number;
};
export type CalculateRatesParams = {
    decimalsA: number;
    decimalsB: number;
    a2b: boolean;
    byAmountIn: boolean;
    amount: BN;
    swapTicks: Array<TickData>;
    currentPool: Pool;
};
export type CalculateRatesResult = {
    estimatedAmountIn: BN;
    estimatedAmountOut: BN;
    estimatedEndSqrtPrice: BN;
    estimatedFeeAmount: BN;
    isExceed: boolean;
    extraComputeLimit: number;
    aToB: boolean;
    byAmountIn: boolean;
    amount: BN;
    priceImpactPct: number;
};
export type SwapParams = {
    pool_id: SuiObjectIdType;
    a2b: boolean;
    by_amount_in: boolean;
    amount: string;
    amount_limit: string;
    swap_partner?: string;
} & CoinPairType;
export type PreSwapParams = {
    pool: Pool;
    current_sqrt_price: number;
    decimalsA: number;
    decimalsB: number;
    a2b: boolean;
    by_amount_in: boolean;
    amount: string;
} & CoinPairType;
export type PreSwapWithMultiPoolParams = {
    poolAddresses: string[];
    decimalsA: number;
    decimalsB: number;
    a2b: boolean;
    byAmountIn: boolean;
    amount: string;
} & CoinPairType;
export type TransPreSwapWithMultiPoolParams = {
    poolAddress: string;
    decimalsA: number;
    decimalsB: number;
    a2b: boolean;
    byAmountIn: boolean;
    amount: string;
} & CoinPairType;
export declare class SwapModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    preSwapWithMultiPool(params: PreSwapWithMultiPoolParams): Promise<{
        poolAddress: string;
        estimatedAmountIn: string;
        estimatedAmountOut: any;
        estimatedEndSqrtPrice: any;
        estimatedFeeAmount: any;
        isExceed: any;
        amount: string;
        aToB: boolean;
        byAmountIn: boolean;
    } | null>;
    preswap(params: PreSwapParams): Promise<{
        poolAddress: string;
        currentSqrtPrice: number;
        estimatedAmountIn: string;
        estimatedAmountOut: any;
        estimatedEndSqrtPrice: any;
        estimatedFeeAmount: any;
        isExceed: any;
        amount: string;
        aToB: boolean;
        byAmountIn: boolean;
    } | null>;
    private transformSwapData;
    private transformSwapWithMultiPoolData;
    calculateRates(params: CalculateRatesParams): CalculateRatesResult;
    /**
     * create swap transaction payload
     * @param params
     * @param gasEstimateArg When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns
     */
    createSwapTransactionPayload(params: SwapParams, gasEstimateArg?: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): Promise<TransactionBlock>;
}
