import { CoinPairType, Position } from '../modules/resourcesModule';
import { SuiAddressType, SuiObjectIdType } from './sui';
export declare const BoosterRouterModule = "router";
export declare const CONFIG_PERCENT_MULTIPER = 10000;
export type BoosterInitEvent = {
    booster_config_id: SuiObjectIdType;
    booster_pool_handle: SuiObjectIdType;
};
export type BoosterPoolImmutables = {
    booster_type: SuiAddressType;
    clmm_pool_id: SuiObjectIdType;
    pool_id: SuiObjectIdType;
} & CoinPairType;
export type BoosterPoolState = {
    basic_percent: number;
    balance: string;
    config: LockMultiplier[];
    lock_positions: {
        lock_positions_handle: SuiObjectIdType;
        size: number;
    };
    is_open: boolean;
    index: number;
};
export type BoosterPool = BoosterPoolImmutables & BoosterPoolState;
export type LockMultiplier = {
    lock_day: number;
    multiplier: number;
};
export type LockPositionInfo = {
    id: SuiObjectIdType;
    type: SuiAddressType;
    position_id: SuiObjectIdType;
    start_time: number;
    lock_period: number;
    end_time: number;
    growth_rewarder: string;
    xcetus_owned: SuiObjectIdType;
    is_settled: boolean;
};
export type LockNFT = {
    locked_nft_id: SuiObjectIdType;
    locked_time: number;
    end_lock_time: number;
    lock_clmm_position: Position;
};
export type LockPositionParams = {
    clmm_position_id: SuiObjectIdType;
    booster_pool_id: SuiObjectIdType;
    clmm_pool_id: SuiObjectIdType;
    lock_day: number;
    booster_type: SuiAddressType;
} & CoinPairType;
export type CancelParams = {
    booster_pool_id: SuiObjectIdType;
    lock_nft_id: SuiObjectIdType;
    booster_type: SuiAddressType;
};
export type RedeemParams = {
    booster_pool_id: SuiObjectIdType;
    clmm_pool_id: SuiObjectIdType;
    lock_nft_id: SuiObjectIdType;
    ve_nft_id: SuiObjectIdType;
    booster_type: SuiAddressType;
} & CoinPairType;
