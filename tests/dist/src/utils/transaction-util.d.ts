import { JsonRpcProvider, RawSigner, TransactionArgument, TransactionBlock, TransactionEffects } from '@mysten/sui.js';
import BN from 'bn.js';
import { SwapParams } from '../modules/swapModule';
import { SwapWithRouterParams } from '../modules/routerModule';
import { CoinAsset, CoinPairType, Pool } from '../modules/resourcesModule';
import { AddLiquidityFixTokenParams, AddLiquidityParams } from '../modules/positionModule';
import { TickData } from '../types/clmmpool';
import SDK, { Percentage, SdkOptions } from '../index';
export declare function findAdjustCoin(coinPair: CoinPairType): {
    isAdjustCoinA: boolean;
    isAdjustCoinB: boolean;
};
export type BuildCoinInputResult = {
    transactionArgument: TransactionArgument[];
    remainCoins: CoinAsset[];
};
export declare function sendTransaction(signer: RawSigner, tx: TransactionBlock, onlyCalculateGas?: boolean): Promise<TransactionEffects | undefined>;
export declare function printTransaction(tx: TransactionBlock): Promise<void>;
export declare class TransactionUtil {
    /**
     * adjust transaction for gas
     * @param sdk
     * @param amount
     * @param tx
     * @returns
     */
    static adjustTransactionForGas(sdk: SDK, allCoins: CoinAsset[], amount: bigint, tx: TransactionBlock): Promise<{
        fixAmount: bigint;
        fixCoinInput?: TransactionArgument;
        newTx?: TransactionBlock;
    }>;
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildAddLiquidityTransactionForGas(sdk: SDK, allCoins: CoinAsset[], params: AddLiquidityFixTokenParams, gasEstimateArg: {
        slippage: number;
        curSqrtPrice: BN;
    }): Promise<TransactionBlock>;
    /**
     * build add liquidity transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildAddLiquidityTransaction(sdk: SDK, allCoinAsset: CoinAsset[], params: AddLiquidityParams | AddLiquidityFixTokenParams): Promise<TransactionBlock>;
    /**
     * fix add liquidity fix token for coin amount
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static fixAddLiquidityFixTokenParams(params: AddLiquidityFixTokenParams, slippage: number, curSqrtPrice: BN): AddLiquidityFixTokenParams;
    private static buildAddLiquidityFixTokenArgs;
    private static buildAddLiquidityArgs;
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildSwapTransactionForGas(sdk: SDK, params: SwapParams, allCoinAsset: CoinAsset[], gasEstimateArg: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): Promise<TransactionBlock>;
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransaction(sdk: SDK, params: SwapParams, allCoinAsset: CoinAsset[]): TransactionBlock;
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionArgs(tx: TransactionBlock, params: SwapParams, sdkOptions: SdkOptions, primaryCoinInput: TransactionArgument): TransactionBlock;
    static fixSwapParams(sdk: SDK, params: SwapParams, gasEstimateArg: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): SwapParams;
    static syncBuildCoinInputForAmount(sdk: SDK, tx: TransactionBlock, amount: bigint, coinType: string): Promise<TransactionArgument | undefined>;
    static buildCoinInputForAmount(tx: TransactionBlock, allCoins: CoinAsset[], amount: bigint, coinType: string, buildVector?: boolean): BuildCoinInputResult | undefined;
    static calculationTxGas(sdk: JsonRpcProvider | RawSigner, tx: TransactionBlock): Promise<number>;
    static buildRouterSwapTransaction(sdk: SDK, params: SwapWithRouterParams, byAmountIn: boolean, allCoinAsset: CoinAsset[]): TransactionBlock;
    static buildCoinTypePair(coinTypes: string[], partitionQuantities: number[]): string[][];
}
