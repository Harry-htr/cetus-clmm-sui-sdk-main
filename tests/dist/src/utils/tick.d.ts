import BN from 'bn.js';
import { Pool } from '../modules/resourcesModule';
import { TickData } from '../types/clmmpool';
export declare class TickUtil {
    /**
     * Get min tick index.
     *
     * @param tick_spacing - tick spacing
     * @retruns min tick index
     */
    static getMinIndex(tickSpacing: number): number;
    /**
     * Get max tick index.
     * @param tick_spacing - tick spacing
     * @retruns max tick index
     */
    static getMaxIndex(tickSpacing: number): number;
}
/**
 * Get nearest tick by current tick.
 *
 * @param tickIndex
 * @param tickSpacing
 * @returns
 */
export declare function getNearestTickByTick(tickIndex: number, tickSpacing: number): number;
export declare function getRewardInTickRange(pool: Pool, tickLower: TickData, tickUpper: TickData, tickLowerIndex: number, tickUpperIndex: number, growthGlobal: BN[]): BN[];
