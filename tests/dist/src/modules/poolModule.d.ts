import { TransactionBlock } from '@mysten/sui.js';
import { TickData } from '../types/clmmpool';
import { SuiObjectIdType } from '../types/sui';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { CoinPairType, PositionReward } from './resourcesModule';
export type CreatePoolParams = {
    tick_spacing: number;
    initialize_sqrt_price: string;
    uri: string;
} & CoinPairType;
export type CreatePoolAddLiquidityParams = {
    amount_a: number | string;
    amount_b: number | string;
    fix_amount_a: boolean;
    tick_lower: number;
    tick_upper: number;
} & CreatePoolParams;
export type FetchParams = {
    pool_id: SuiObjectIdType;
} & CoinPairType;
export declare class PoolModule implements IModule {
    protected _sdk: SDK;
    constructor(sdk: SDK);
    get sdk(): SDK;
    creatPoolsTransactionPayload(paramss: CreatePoolParams[]): Promise<TransactionBlock>;
    /**
     * Create a pool of clmmpool protocol. The pool is identified by (CoinTypeA, CoinTypeB, tick_spacing).
     * @param params
     * @returns
     */
    creatPoolTransactionPayload(params: CreatePoolParams | CreatePoolAddLiquidityParams): Promise<TransactionBlock>;
    private creatPool;
    private creatPoolAndAddLiquidity;
    fetchTicks(params: FetchParams): Promise<TickData[]>;
    private getTicks;
    fetchPositionRewardList(params: FetchParams): Promise<PositionReward[]>;
    fetchTicksByRpc(tickHandle: string): Promise<TickData[]>;
    private getTicksByRpc;
    getTickDataByIndex(tickHandle: string, tickIndex: number): Promise<TickData>;
    getTickDataByObjectId(tickId: string): Promise<TickData>;
}
