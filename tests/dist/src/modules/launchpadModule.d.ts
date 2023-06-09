import { TransactionBlock } from '@mysten/sui.js';
import { CreateLaunchpadPoolParams, LaunchpadInitEvent, LaunchpadPoolImmutables, LaunchpadPool, PurchaseParams, ClaimParams, WithdrawParams, UnlockNftParams, SettleParams, CancelParams, RemoveWhitelistParams, PurchaseMark, SettleEvent, UpdateWhitelistCapParams, AddUserToWhitelistParams, UpdateRecipientParams, UpdatePoolDurationParams } from '../types/luanchpa_type';
import { SuiObjectIdType, SuiAddressType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { Position } from './resourcesModule';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export declare const intervalFaucetTime: number;
export declare class LaunchpadModule implements IModule {
    protected _sdk: SDK;
    private readonly _cache;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getPoolImmutables(assignPools?: string[], offset?: number, limit?: number, forceRefresh?: boolean): Promise<LaunchpadPoolImmutables[]>;
    getPools(assignPools?: string[], offset?: number, limit?: number): Promise<LaunchpadPool[]>;
    getPool(poolObjectId: string, forceRefresh?: boolean): Promise<LaunchpadPool>;
    getInitFactoryEvent(forceRefresh?: boolean): Promise<LaunchpadInitEvent>;
    getLockNFT(nft_id: SuiObjectIdType, forceRefresh?: boolean): Promise<Position | undefined>;
    getLockNFTList(poolType: SuiAddressType, recipient: SuiObjectIdType): Promise<Position[]>;
    creatPoolTransactionPayload(params: CreateLaunchpadPoolParams): Promise<TransactionBlock>;
    creatPurchasePayload(params: PurchaseParams): Promise<Promise<TransactionBlock>>;
    creatClaimPayload(params: ClaimParams): Promise<TransactionBlock>;
    creatSettlePayload(params: SettleParams): Promise<TransactionBlock>;
    creatWithdrawPayload(params: WithdrawParams): TransactionBlock;
    addUserToWhitelisPayload(params: AddUserToWhitelistParams): TransactionBlock;
    updateWhitelistCaPayload(params: UpdateWhitelistCapParams): TransactionBlock;
    creatRemoveWhitelistPayload(params: RemoveWhitelistParams): TransactionBlock;
    creatCancelPoolPayload(params: CancelParams): TransactionBlock;
    updateRecipientPayload(params: UpdateRecipientParams): TransactionBlock;
    updatePoolDuractionPayload(params: UpdatePoolDurationParams): TransactionBlock;
    creatUnlockNftPayload(params: UnlockNftParams): TransactionBlock;
    isAdminCap(walletAddress: SuiObjectIdType): Promise<boolean>;
    isWhiteListUser(whitetHandle: SuiObjectIdType, walletAddress: SuiObjectIdType): Promise<boolean>;
    getPurchaseAmount(purchaseHandle: SuiObjectIdType, walletAddress: SuiObjectIdType): Promise<{
        safe_limit_amount: string;
        safe_purchased_amount: string;
    }>;
    getPurchaseMarks(accountAddress: string, poolAddressArray?: SuiObjectIdType[], forceRefresh?: boolean): Promise<PurchaseMark[]>;
    getSettleEvent(poolAddress: SuiObjectIdType): Promise<SettleEvent | undefined>;
    buildLaunchpadCoinType(coin_type_sale: SuiAddressType, coin_type_raise: SuiAddressType): string;
    private assertLuanchpadConfig;
    private updateCache;
}
