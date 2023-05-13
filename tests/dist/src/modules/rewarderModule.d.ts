import BN from 'bn.js';
import { TransactionBlock } from '@mysten/sui.js';
import { SuiAddressType, SuiObjectIdType } from '../types/sui';
import { CoinPairType, Pool } from './resourcesModule';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
export type CollectRewarderParams = {
    pool_id: SuiObjectIdType;
    pos_id: SuiObjectIdType;
    collect_fee: boolean;
    rewarder_coin_types: SuiAddressType[];
} & CoinPairType;
export type RewarderAmountOwed = {
    amount_owed: BN;
    coin_address: string;
};
export declare class RewarderModule implements IModule {
    protected _sdk: SDK;
    private growthGlobal;
    constructor(sdk: SDK);
    get sdk(): SDK;
    emissionsEveryDay(poolObjectId: string): Promise<{
        emissions: number;
        coin_address: string;
    }[] | null>;
    updatePoolRewarder(poolObjectId: string, currentTime: BN): Promise<Pool>;
    posRewardersAmount(poolObjectId: string, positionHandle: string, positionId: string): Promise<RewarderAmountOwed[]>;
    poolRewardersAmount(account: string, poolObjectId: string): Promise<BN[]>;
    private posRewardersAmountInternal;
    private getPoolLowerAndUpperTicks;
    /**
     * Collect rewards from Position.
     * @param params
     * @param gasBudget
     * @returns
     */
    collectRewarderTransactionPayload(params: CollectRewarderParams): TransactionBlock;
}
