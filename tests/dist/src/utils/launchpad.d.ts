import { SuiObjectResponse } from '@mysten/sui.js';
import { SDK } from '../sdk';
import { LaunchpadPool, LaunchpadPoolState } from '../types/luanchpa_type';
export declare class LauncpadUtil {
    static priceRealToFix(price: number, saleDecimals: number, raiseDecimals: number): number;
    static priceFixToReal(price: number, saleDecimals: number, raiseDecimals: number): number;
    static raiseTotalAmount(pool: LaunchpadPool, saleDecimals: number, raiseDecimals: number): number;
    static buildLaunchPadPool(objects: SuiObjectResponse): LaunchpadPool;
    static updatePoolStatus(pool: LaunchpadPoolState): LaunchpadPoolState;
    /**
     * update Pool Current Price
     * @param pool
     * @param saleDecimals
     * @param raiseDecimals
     * @returns
     */
    static updatePoolCurrentPrice(pool: LaunchpadPool, saleDecimals: number, raiseDecimals: number): number;
    /**
     * calculate Pool Price
     * @param sdk
     * @param pool
     */
    static calculatePoolPrice(sdk: SDK, pool: LaunchpadPool): Promise<void>;
    /**
     * https://git.cplus.link/cetus/cetus-launchpad/-/blob/whitelist/sui/IDO/sources/pool.move#L887
     * withdraw_sale_internal
     * @param pool
     * @returns
     */
    static getWithdrawRaise(pool: LaunchpadPool): Promise<string>;
    /**
     * https://git.cplus.link/cetus/cetus-launchpad/-/blob/whitelist/sui/IDO/sources/pool.move#L906
     * withdraw_raise_internal
     * @param pool
     * @returns
     */
    static getWithdrawSale(pool: LaunchpadPool): Promise<string>;
    /**
     * https://m8bj5905cd.larksuite.com/docx/V5AKdlbm3o3muFxh2dwu5C9RsTb
     * $$raiseAmount=min(totalRaised，hardcap)$$
     * @param sdk
     * @param pool
     * @returns
     */
    static getHistoryWithdrawRaise(sdk: SDK, pool: LaunchpadPool): Promise<import("decimal.js").default | "0">;
    static getHistoryWithdrawSale(sdk: SDK, pool: LaunchpadPool): Promise<string>;
    /**
     * https://m8bj5905cd.larksuite.com/docx/V5AKdlbm3o3muFxh2dwu5C9RsTb
     * Returning the user's assets in excess
     * @param sdk
     * @param pool
     * @returns
     */
    static getOverrecruitReverseAmount(sdk: SDK, pool: LaunchpadPool): Promise<string>;
    /**
     * https://m8bj5905cd.larksuite.com/docx/V5AKdlbm3o3muFxh2dwu5C9RsTb
     * @param sdk
     * @param pool
     * @returns
     */
    static getCanPurchaseAmount(sdk: SDK, pool: LaunchpadPool): Promise<string>;
}
