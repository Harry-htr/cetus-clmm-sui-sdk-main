import { ObjectContentFields, SuiMoveObject, SuiTransactionBlockResponse, TransactionDigest } from '@mysten/sui.js';
import { SuiAddressType, SuiObjectIdType, NFT } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export declare const intervalFaucetTime: number;
export declare enum PositionStatus {
    'Deleted' = "Deleted",
    'Exists' = "Exists",
    'NotExists' = "NotExists"
}
export type Position = {
    pos_object_id: SuiObjectIdType;
    owner: SuiObjectIdType;
    pool: SuiObjectIdType;
    type: SuiAddressType;
    coin_type_a: SuiAddressType;
    coin_type_b: SuiAddressType;
    index: number;
    liquidity: string;
    tick_lower_index: number;
    tick_upper_index: number;
    position_status: PositionStatus;
} & NFT & PositionReward;
export type PositionReward = {
    pos_object_id: SuiObjectIdType;
    liquidity: string;
    tick_lower_index: number;
    tick_upper_index: number;
    fee_growth_inside_a: string;
    fee_owed_a: string;
    fee_growth_inside_b: string;
    fee_owed_b: string;
    reward_amount_owed_0: string;
    reward_amount_owed_1: string;
    reward_amount_owed_2: string;
    reward_growth_inside_0: string;
    reward_growth_inside_1: string;
    reward_growth_inside_2: string;
};
export type CoinPairType = {
    coinTypeA: SuiAddressType;
    coinTypeB: SuiAddressType;
};
export type PoolImmutables = {
    poolAddress: string;
    tickSpacing: string;
} & CoinPairType;
export type Pool = {
    poolType: string;
    coinAmountA: number;
    coinAmountB: number;
    current_sqrt_price: number;
    current_tick_index: number;
    fee_growth_global_b: number;
    fee_growth_global_a: number;
    fee_protocol_coin_a: number;
    fee_protocol_coin_b: number;
    fee_rate: number;
    is_pause: boolean;
    liquidity: number;
    index: number;
    positions_handle: string;
    rewarder_infos: Array<Rewarder>;
    rewarder_last_updated_time: string;
    ticks_handle: string;
    uri: string;
    name: string;
} & PoolImmutables;
export type Rewarder = {
    coinAddress: string;
    emissions_per_second: number;
    growth_global: number;
    emissionsEveryDay: number;
};
export type InitEvent = {
    pools_id: SuiObjectIdType;
    global_config_id: SuiObjectIdType;
    global_vault_id: SuiObjectIdType;
};
export type CreatePartnerEvent = {
    name: string;
    recipient: SuiAddressType;
    partner_id: SuiObjectIdType;
    partner_cap_id: SuiObjectIdType;
    fee_rate: string;
    start_epoch: string;
    end_epoch: string;
};
export type FaucetEvent = {
    id: string;
    time: number;
};
export type CoinAsset = {
    coinAddress: SuiAddressType;
    coinObjectId: SuiObjectIdType;
    balance: bigint;
};
export type WarpSuiObject = {
    coinAddress: SuiAddressType;
    balance: number;
} & SuiMoveObject;
export type FaucetCoin = {
    transactionModule: string;
    suplyID: SuiObjectIdType;
    decimals: number;
} & ObjectContentFields;
export declare class ResourcesModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getSuiTransactionResponse(digest: TransactionDigest, forceRefresh?: boolean): Promise<SuiTransactionBlockResponse | null>;
    getFaucetEvent(packageObjectId: SuiObjectIdType, walletAddress: SuiAddressType, forceRefresh?: boolean): Promise<FaucetEvent | null>;
    getInitEvent(forceRefresh?: boolean): Promise<InitEvent>;
    getCreatePartnerEvent(forceRefresh?: boolean): Promise<CreatePartnerEvent[]>;
    getPoolImmutables(assignPools?: string[], offset?: number, limit?: number, forceRefresh?: boolean): Promise<PoolImmutables[]>;
    getPools(assignPools?: string[], offset?: number, limit?: number): Promise<Pool[]>;
    getPool(poolObjectId: string, forceRefresh?: boolean): Promise<Pool>;
    buildPositionType(): string;
    getPositionList(accountAddress: string, assignPoolIds?: string[]): Promise<Position[]>;
    getPosition(positionHandle: string, positionId: string): Promise<Position>;
    getPositionById(positionId: string): Promise<Position>;
    getSipmlePosition(positionId: string): Promise<Position>;
    private getSipmlePositionByCache;
    getSipmlePositionList(positionIds: SuiObjectIdType[]): Promise<Position[]>;
    private updatePositionRewarders;
    getOwnerCoinAssets(suiAddress: string, coinType?: string | null): Promise<CoinAsset[]>;
    getSuiObjectOwnedByAddress(suiAddress: string): Promise<WarpSuiObject[]>;
    private updateCache;
}
