import { SuiObjectIdType, SuiAddressType, NFT } from './sui';
export declare const XwhaleRouterModule = "router";
export declare const DividendsRouterModule = "router";
export declare const ONE_DAY_SECONDS: number;
export declare const EXCHANGE_RATE_MULTIPER = 1000;
export declare const REDEEM_NUM_MULTIPER = 100000000000;
export type XwhaleInitEvent = {
    xwhale_manager_id: SuiObjectIdType;
};
export type LockUpManagerEvent = {
    lock_manager_id: SuiObjectIdType;
    max_lock_day: number;
    max_percent_numerator: number;
    min_lock_day: number;
    min_percent_numerator: number;
};
export type DividendManagerEvent = {
    dividend_manager_id: SuiObjectIdType;
};
export type VeNFT = {
    id: SuiObjectIdType;
    type: string;
    index: string;
    xwhale_balance: string;
} & NFT;
export type LockWhale = {
    id: SuiObjectIdType;
    type: SuiAddressType;
    locked_start_time: number;
    locked_until_time: number;
    lock_day: number;
    whale_amount: string;
    xwhale_amount: string;
};
export type ConvertParams = {
    amount: string;
    venft_id?: SuiObjectIdType;
};
export type RedeemLockParams = {
    amount: string;
    venft_id: SuiObjectIdType;
    lock_day: number;
};
export type RedeemParams = {
    venft_id: SuiObjectIdType;
    lock_id: SuiObjectIdType;
};
export type CancelRedeemParams = {
    venft_id: SuiObjectIdType;
    lock_id: SuiObjectIdType;
};
export type XwhaleManager = {
    id: SuiObjectIdType;
    index: number;
    has_venft: {
        handle: SuiObjectIdType;
        size: number;
    };
    nfts: {
        handle: SuiObjectIdType;
        size: number;
    };
    total_locked: string;
    treasury: string;
};
export type VeNFTDividendInfo = {
    id: SuiObjectIdType;
    ve_nft_id: SuiObjectIdType;
    rewards: DividendReward[];
};
export type DividendReward = {
    period: number;
    rewards: {
        coin_type: SuiAddressType;
        amount: string;
    }[];
};
export type DividendManager = {
    id: SuiObjectIdType;
    dividends: {
        id: SuiObjectIdType;
        size: number;
    };
    venft_dividends: {
        id: SuiObjectIdType;
        size: number;
    };
    bonus_types: SuiAddressType[];
    start_time: number;
    interval_day: number;
    settled_phase: number;
    balances: {
        id: SuiObjectIdType;
        size: number;
    };
    is_open: true;
};
