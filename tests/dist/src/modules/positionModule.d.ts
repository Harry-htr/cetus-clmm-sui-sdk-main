import BN from 'bn.js';
import { TransactionBlock } from '@mysten/sui.js';
import { SuiAddressType, SuiObjectIdType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { CoinPairType } from './resourcesModule';
type CommonParams = {
    pool_id: SuiObjectIdType;
    pos_id: SuiObjectIdType;
};
export type AddLiquidityFixTokenParams = {
    amount_a: number | string;
    amount_b: number | string;
    fix_amount_a: boolean;
    is_open: boolean;
} & AddLiquidityCommonParams;
export type AddLiquidityParams = {
    delta_liquidity: string;
    max_amount_a: number | string;
    max_amount_b: number | string;
} & AddLiquidityCommonParams;
export type AddLiquidityCommonParams = {
    tick_lower: string | number;
    tick_upper: string | number;
} & CoinPairType & CommonParams;
export type OpenPositionParams = {
    tick_lower: string;
    tick_upper: string;
    pool_id: SuiObjectIdType;
} & CoinPairType;
export type RemoveLiquidityParams = {
    delta_liquidity: string;
    min_amount_a: string;
    min_amount_b: string;
    collect_fee: boolean;
} & CommonParams & CoinPairType;
export type ClosePositionParams = {
    rewarder_coin_types: SuiAddressType[];
    min_amount_a: string;
    min_amount_b: string;
} & CoinPairType & CommonParams;
export type CollectFeeParams = CommonParams & CoinPairType;
export declare class PositionModule implements IModule {
    protected _sdk: SDK;
    constructor(sdk: SDK);
    get sdk(): SDK;
    /**
     * create add liquidity transaction payload
     * @param params
     * @param gasEstimateArg : When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns
     */
    createAddLiquidityTransactionPayload(params: AddLiquidityParams | AddLiquidityFixTokenParams, gasEstimateArg?: {
        slippage: number;
        curSqrtPrice: BN;
    }): Promise<TransactionBlock>;
    /**
     * Remove liquidity from a position.
     * @param params
     * @param gasBudget
     * @returns
     */
    removeLiquidityTransactionPayload(params: RemoveLiquidityParams): TransactionBlock;
    /**
     * Close position and remove all liquidity and collect_reward
     * @param params
     * @param gasBudget
     * @returns
     */
    closePositionTransactionPayload(params: ClosePositionParams): TransactionBlock;
    /**
     * Open position in clmmpool.
     * @param params
     * @returns
     */
    openPositionTransactionPayload(params: OpenPositionParams): TransactionBlock;
    /**
     * Collect LP fee from Position.
     * @param params
     * @returns
     */
    collectFeeTransactionPayload(params: CollectFeeParams): TransactionBlock;
}
export {};
