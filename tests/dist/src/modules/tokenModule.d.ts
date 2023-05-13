import { SuiResource, SuiObjectIdType, SuiAddressType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export type TokenInfo = {
    name: string;
    symbol: string;
    official_symbol: string;
    coingecko_id: string;
    decimals: number;
    project_url: string;
    logo_url: string;
    address: string;
} & Record<string, any>;
export type PoolInfo = {
    symbol: string;
    name: string;
    decimals: number;
    fee: string;
    tick_spacing: number;
    type: string;
    address: string;
    coin_a_address: string;
    coin_b_address: string;
    project_url: string;
    sort: number;
    is_display_rewarder: boolean;
    rewarder_display1: boolean;
    rewarder_display2: boolean;
    rewarder_display3: boolean;
    is_stable: boolean;
} & Record<string, any>;
export type TokenConfigEvent = {
    coin_registry_id: SuiObjectIdType;
    coin_list_owner: SuiObjectIdType;
    pool_registry_id: SuiObjectIdType;
    pool_list_owner: SuiObjectIdType;
};
export declare class TokenModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getAllRegisteredTokenList(forceRefresh?: boolean): Promise<TokenInfo[]>;
    getOwnerTokenList(listOwnerAddr?: string, forceRefresh?: boolean): Promise<TokenInfo[]>;
    getAllRegisteredPoolList(forceRefresh?: boolean): Promise<PoolInfo[]>;
    getOwnerPoolList(listOwnerAddr?: string, forceRefresh?: boolean): Promise<PoolInfo[]>;
    getWarpPoolList(forceRefresh?: boolean): Promise<PoolInfo[]>;
    getOwnerWarpPoolList(poolOwnerAddr?: string, coinOwnerAddr?: string, forceRefresh?: boolean): Promise<PoolInfo[]>;
    getTokenListByCoinTypes(coinTypes: SuiAddressType[]): Promise<Record<string, TokenInfo>>;
    private factchTokenList;
    private factchPoolList;
    private factchWarpPoolList;
    getTokenConfigEvent(forceRefresh?: boolean): Promise<TokenConfigEvent>;
    private transformData;
    updateCache(key: string, data: SuiResource, time?: number): void;
    private getCacheData;
}
