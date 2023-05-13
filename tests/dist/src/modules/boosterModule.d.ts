import { TransactionBlock } from '@mysten/sui.js';
import BN from 'bn.js';
import { BoosterInitEvent, BoosterPool, BoosterPoolImmutables, CancelParams, LockNFT, LockPositionInfo, LockPositionParams, RedeemParams } from '../types/booster_type';
import { SuiObjectIdType, SuiAddressType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { RewarderAmountOwed } from './rewarderModule';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export declare const intervalFaucetTime: number;
export declare class BoosterModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getPoolImmutables(forceRefresh?: boolean): Promise<BoosterPoolImmutables[]>;
    getPoolImmutable(poolObjectId: SuiObjectIdType): Promise<BoosterPoolImmutables>;
    getPools(): Promise<BoosterPool[]>;
    getPool(poolObjectId: string, forceRefresh?: boolean): Promise<BoosterPool>;
    private getPoolHandleId;
    getInitFactoryEvent(): Promise<BoosterInitEvent>;
    getOwnerLockNfts(accountAddress: SuiAddressType, clmm_pool_id?: string): Promise<LockNFT[]>;
    getLockNftById(locked_nft_id: SuiObjectIdType): Promise<LockNFT | undefined>;
    getLockPositionInfos(lock_positions_handle: SuiObjectIdType, lock_nft_ids?: SuiObjectIdType[]): Promise<LockPositionInfo[]>;
    getLockPositionInfo(lock_positions_handle: SuiObjectIdType, lock_nft_id: SuiObjectIdType): Promise<LockPositionInfo | undefined>;
    getLockPositionInfoById(id: SuiObjectIdType): Promise<LockPositionInfo | undefined>;
    calculateXCetusRewarder(clmmRewarders: RewarderAmountOwed[], boosterPool: BoosterPool, lockPositionInfo: LockPositionInfo): BN;
    /**
     * lock position
     * @param params
     * @returns
     */
    lockPositionPayload(params: LockPositionParams): TransactionBlock;
    /**
     * Cancel lock
     * @param params
     * @returns
     */
    canceLockPositionPayload(params: CancelParams): TransactionBlock;
    /**
     * Redeem the rewarder, get back the Clmm Position if the lock time ends.
     * @param params
     * @returns
     */
    redeemPayload(params: RedeemParams): TransactionBlock;
    private updateCache;
}
