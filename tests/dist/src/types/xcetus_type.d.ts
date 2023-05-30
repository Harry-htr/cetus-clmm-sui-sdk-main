import { SuiObjectIdType, SuiAddressType, NFT } from './sui';
export declare const XcetusRouterModule = "router";
export declare const DividendsRouterModule = "router";
export declare const ONE_DAY_SECONDS = 60;
export declare const EXCHANGE_RATE_MULTIPER = 1000;
export declare const REDEEM_NUM_MULTIPER = 100000000000;
export declare type XcetusInitEvent = {
    xcetus_manager_id: SuiObjectIdType;
};
export declare type LockUpManagerEvent = {
    lock_manager_id: SuiObjectIdType;
    lock_handle_id: SuiObjectIdType;
    max_lock_day: number;
    max_percent_numerator: number;
    min_lock_day: number;
    min_percent_numerator: number;
};
export declare type DividendManagerEvent = {
    dividend_manager_id: SuiObjectIdType;
};
export declare type VeNFT = {
    id: SuiObjectIdType;
    type: string;
    index: string;
    xcetus_balance: string;
} & NFT;
export declare type LockCetus = {
    id: SuiObjectIdType;
    type: SuiAddressType;
    locked_start_time: number;
    locked_until_time: number;
    lock_day: number;
    cetus_amount: string;
    xcetus_amount: string;
};
export declare type ConvertParams = {
    amount: string;
    venft_id?: SuiObjectIdType;
};
export declare type RedeemLockParams = {
    amount: string;
    venft_id: SuiObjectIdType;
    lock_day: number;
};
export declare type RedeemParams = {
    venft_id: SuiObjectIdType;
    lock_id: SuiObjectIdType;
};
export declare type CancelRedeemParams = {
    venft_id: SuiObjectIdType;
    lock_id: SuiObjectIdType;
};
export declare type XcetusManager = {
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
export declare type VeNFTDividendInfo = {
    id: SuiObjectIdType;
    ve_nft_id: SuiObjectIdType;
    rewards: DividendReward[];
};
export declare type DividendReward = {
    period: number;
    rewards: {
        coin_type: SuiAddressType;
        amount: string;
    }[];
};
export declare type DividendManager = {
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
    balances: {
        id: SuiObjectIdType;
        size: number;
    };
    is_open: true;
};
