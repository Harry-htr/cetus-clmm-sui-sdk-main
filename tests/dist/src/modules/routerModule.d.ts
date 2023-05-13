import BN from 'bn.js';
import { Graph } from '@syntsugar/cc-graph';
import { SDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
export interface CoinNode {
    address: string;
    decimals: number;
}
export interface CoinProvider {
    coins: CoinNode[];
}
export interface PathLink {
    base: string;
    quote: string;
    addressMap: Map<number, string>;
}
export interface PathProvider {
    paths: PathLink[];
}
export type SplitStep = {
    feeRate: number;
    pool: string;
    a2b: boolean;
    splitStepPercent: number;
    splitStepAmount: string;
};
export type OneStep = {
    stepAmount: BN;
    isExceed: boolean;
    splitSteps: SplitStep[];
};
export type OneStepResult = {
    addressArr: string[];
    amountArr: BN[];
    percentArr: number[];
    a2bArr: boolean[];
};
export type OnePath = {
    amountIn: BN;
    amountOut: BN;
    poolAddress: string[];
    a2b: boolean[];
    rawAmountLimit: BN[];
    isExceed: boolean;
    coinType: string[];
};
export type OneRouter = {
    amountIn: BN;
    amountOut: BN;
    paths: OnePath[];
    isExceed: boolean;
    byAmountIn: boolean;
};
export type AddressAndDirection = {
    addressMap: Map<number, string>;
    direction: boolean;
};
export type SwapWithRouterParams = {
    paths: OnePath[];
    partner: string;
    priceSplitPoint: number;
};
export declare class RouterModule implements IModule {
    readonly graph: Graph;
    readonly pathProviders: PathProvider[];
    private coinProviders;
    private _coinAddressMap;
    private poolAddressMap;
    private poolMap;
    private ticksMap;
    private leastRefreshTime;
    private createTxParams;
    private poolDirectionMap;
    private isInited;
    protected _sdk: SDK;
    constructor(sdk: SDK);
    get sdk(): SDK;
    getPoolAddressMapAndDirection(base: string, quote: string): AddressAndDirection | undefined;
    setCoinList(): void;
    loadGraph(): void;
    addPathProvider(provider: PathProvider): RouterModule;
    addCoinProvider(provider: CoinProvider): RouterModule;
    tokenInfo(key: string): CoinNode | undefined;
    getCreateTxParams(): SwapWithRouterParams;
    isPoolDirectionSet(poolAddress: string): boolean;
    getPoolDirection(poolAddress: string): boolean | undefined;
    setPoolDirection(poolAddress: string, direction: boolean): void;
    getPoolAddress(base: string, quote: string, feeRate: number): string;
    private getBestStepResult;
    private getBestPathResult;
    private transformPathResult;
    private findOnePath;
    private findBestRouter;
    private getBestRouterResult;
    findUnFetchPools(poolAddresses: string[]): string[];
    refreshPoolofSwapRouter(poolAddresses: string[]): Promise<void>;
    price(base: string, quote: string, amount: BN, byAmountIn: boolean, priceSplitPoint: number, partner: string): Promise<OneRouter | undefined>;
}
