import { ObjectId, SuiMoveObject, SuiTransactionBlockResponse } from '@mysten/sui.js';
import { FaucetCoin, CoinAsset } from '../modules/resourcesModule';
import { SuiAddressType } from '../types/sui';
export declare const DEFAULT_GAS_BUDGET_FOR_SPLIT = 1000;
export declare const DEFAULT_GAS_BUDGET_FOR_MERGE = 500;
export declare const DEFAULT_GAS_BUDGET_FOR_TRANSFER = 100;
export declare const DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI = 100;
export declare const DEFAULT_GAS_BUDGET_FOR_STAKE = 1000;
export declare const GAS_TYPE_ARG = "0x2::sui::SUI";
export declare const GAS_SYMBOL = "SUI";
export declare const DEFAULT_NFT_TRANSFER_GAS_FEE = 450;
export declare const SUI_SYSTEM_STATE_OBJECT_ID = "0x0000000000000000000000000000000000000005";
export declare class CoinAssist {
    static getCoinTypeArg(obj: SuiMoveObject): string | null;
    static isSUI(obj: SuiMoveObject): boolean;
    static getCoinSymbol(coinTypeArg: string): string;
    static getBalance(obj: SuiMoveObject): bigint;
    static totalBalance(objs: CoinAsset[], coinAddress: SuiAddressType): bigint;
    static getID(obj: SuiMoveObject): ObjectId;
    static getCoinTypeFromArg(coinTypeArg: string): string;
    static getFaucetCoins(suiTransactionResponse: SuiTransactionBlockResponse): FaucetCoin[];
    static getCoinAssets(coinType: string, allSuiObjects: CoinAsset[]): CoinAsset[];
    static isSuiCoin(coinAddress: SuiAddressType): boolean;
    static selectCoinObjectIdGreaterThanOrEqual(coins: CoinAsset[], amount: bigint, exclude?: ObjectId[]): {
        objectArray: ObjectId[];
        remainCoins: CoinAsset[];
    };
    static selectCoinAssetGreaterThanOrEqual(coins: CoinAsset[], amount: bigint, exclude?: ObjectId[]): {
        selectedCoins: CoinAsset[];
        remainingCoins: CoinAsset[];
    };
    /**
     * Sort coin by balance in an ascending order
     */
    static sortByBalance(coins: CoinAsset[]): CoinAsset[];
    static sortByBalanceDes(coins: CoinAsset[]): CoinAsset[];
    static calculateTotalBalance(coins: CoinAsset[]): bigint;
}
