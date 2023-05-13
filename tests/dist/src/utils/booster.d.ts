import { BoosterPoolImmutables, BoosterPoolState, LockNFT, LockPositionInfo } from '../types/booster_type';
export declare class BoosterUtil {
    static buildPoolImmutables(data: any): BoosterPoolImmutables;
    static buildPoolState(data: any): BoosterPoolState;
    static buildLockNFT(data: any): LockNFT | undefined;
    static buildLockPositionInfo(data: any): LockPositionInfo | undefined;
    static isLocked(lock: LockNFT): boolean;
}
