import { MakerPoolImmutables, MakerPoolState, RewarderMultiplier, PoolBonusInfo, MarkerPosition } from '../types/maker_type';
import { LockNFT, LockPositionInfo } from '../types/booster_type';
export declare class MakerUtil {
    static buildPoolImmutables(data: any): MakerPoolImmutables;
    static buildPoolState(data: any): MakerPoolState;
    static buildLockNFT(data: any): LockNFT | undefined;
    static buildLockPositionInfo(data: any): LockPositionInfo | undefined;
    static buildMarkerPositions(data: any): MarkerPosition[];
    static buildPoolBonusInfo(data: any): PoolBonusInfo;
    static getBonusPercent(configs: RewarderMultiplier[], percent: number): number;
}
