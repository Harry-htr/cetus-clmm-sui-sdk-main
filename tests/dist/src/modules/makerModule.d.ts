import { TransactionBlock } from '@mysten/sui.js';
import Decimal from 'decimal.js';
import { ClaimAllParams, ClaimParams, MakerInitEvent, MakerPool, MakerPoolImmutables, MakerPoolPeriod, MarkerPosition, PoolBonusInfo } from '../types/maker_type';
import { SuiObjectIdType, SuiAddressType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export declare const intervalFaucetTime: number;
export declare class MakerModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getPoolImmutables(forceRefresh?: boolean): Promise<MakerPoolImmutables[]>;
    getPoolImmutable(poolObjectId: SuiObjectIdType): Promise<MakerPoolImmutables>;
    getPools(): Promise<MakerPool[]>;
    getPool(poolObjectId: string, forceRefresh?: boolean): Promise<MakerPool>;
    private getPoolHandleId;
    getMakerPoolPeriods(pool: MakerPool, forceRefresh?: boolean): Promise<MakerPoolPeriod[]>;
    getInitFactoryEvent(): Promise<MakerInitEvent>;
    getPoolMarkerPositionList(whale_nfts_handle: SuiObjectIdType, makerPoolPeriods: MakerPoolPeriod[], forceRefresh?: boolean): Promise<Record<number, MarkerPosition[]>>;
    updateXCetusRewarderAndFee(pool: MakerPool, positionList: MarkerPosition[], makerPoolPeriod: MakerPoolPeriod): Promise<MarkerPosition[]>;
    calculateXCetusRewarder(pool: MakerPool, position: MarkerPosition, period: number, total_points_after_multiper: string): Promise<string>;
    calculateFeeShareRate(pool: MakerPool, position: MarkerPosition, total_points_after_multiper: string): {
        fee_share_rate: number;
        points_after_multiper: string;
    };
    calculateTotalPointsAfterMultiper(pool: MakerPool, makerPoolPeriod: MakerPoolPeriod): Promise<string>;
    calculateAllXCetusRewarder(pools: MakerPool[]): Promise<{
        claimtotal: Decimal;
        claimRecord: {
            bonus_type: SuiAddressType;
            pool_id: SuiObjectIdType;
            nft_ids: SuiObjectIdType[];
        }[];
    }>;
    getPoolBonusInfo(rewarder_handle: SuiObjectIdType, period: number, forceRefresh?: boolean): Promise<PoolBonusInfo>;
    /**
     * Claim the bonus
     * @param params
     * @returns
     */
    claimPayload(params: ClaimParams): TransactionBlock;
    claimAllPayload(params: ClaimAllParams): TransactionBlock;
    private updateCache;
}
