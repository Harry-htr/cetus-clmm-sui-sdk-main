import { TransactionBlock } from '@mysten/sui.js';
import { CancelRedeemParams, ConvertParams, DividendManager, DividendManagerEvent, LockUpManagerEvent, LockCetus, RedeemLockParams, RedeemParams, VeNFT, VeNFTDividendInfo, XcetusInitEvent, XcetusManager } from '../types/xcetus_type';
import { SuiAddressType, SuiObjectIdType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { CoinAsset } from './resourcesModule';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export declare const intervalFaucetTime: number;
export declare class XCetusModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getOwnerVeNFT(accountAddress: SuiAddressType, forceRefresh?: boolean): Promise<VeNFT | undefined>;
    getOwnerLockCetuss(accountAddress: SuiAddressType): Promise<LockCetus[]>;
    getLockCetus(lock_id: SuiObjectIdType): Promise<LockCetus | undefined>;
    getOwnerCetusCoins(accountAddress: SuiAddressType): Promise<CoinAsset[]>;
    /**
     * mint venft
     * @returns
     */
    mintVeNFTPayload(): TransactionBlock;
    /**
     * Convert Cetus to Xcetus.
     * @param params
     * @returns
     */
    convertPayload(params: ConvertParams): Promise<TransactionBlock>;
    /**
     * Convert Xcetus to Cetus, first step is to lock the Cetus for a period.
     * When the time is reach, cetus can be redeem and xcetus will be burned.
     * @param params
     * @returns
     */
    redeemLockPayload(params: RedeemLockParams): TransactionBlock;
    /**
     * lock time is reach and the cetus can be redeemed, the xcetus will be burned.
     * @param params
     * @returns
     */
    redeemPayload(params: RedeemParams): TransactionBlock;
    redeemDividendPayload(venft_id: SuiObjectIdType, bonus_types: SuiAddressType[]): TransactionBlock;
    buileCetusCoinType(): SuiAddressType;
    /**
     * Cancel the redeem lock, the cetus locked will be return back to the manager and the xcetus will be available again.
     * @param params
     * @returns
     */
    cancelRedeemPayload(params: CancelRedeemParams): TransactionBlock;
    getInitFactoryEvent(): Promise<XcetusInitEvent>;
    getLockUpManagerEvent(): Promise<LockUpManagerEvent>;
    getLockInfoHandle(): Promise<string>;
    getDividendManagerEvent(): Promise<DividendManagerEvent>;
    getDividendManager(forceRefresh?: boolean): Promise<DividendManager>;
    getXcetusManager(): Promise<XcetusManager>;
    getVeNFTDividendInfo(venft_dividends_handle: string, venft_id: SuiObjectIdType): Promise<VeNFTDividendInfo | undefined>;
    redeemNum(redeemAmount: string | number, lock_day: number): Promise<{
        amountOut: string;
        percent: string;
    }>;
    reverseRedeemNum(amount: string | number, lock_day: number): Promise<{
        amountOut: string;
        percent: string;
    }>;
    getXCetusAmount(lock_id: string): Promise<string>;
    private updateCache;
}
