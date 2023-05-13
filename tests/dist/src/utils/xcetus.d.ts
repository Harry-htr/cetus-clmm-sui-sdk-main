import Decimal from 'decimal.js';
import { DividendManager, LockCetus, VeNFT, VeNFTDividendInfo } from '../types/xcetus_type';
export declare class XCetusUtil {
    static buildVeNFTDividendInfo(fields: any): VeNFTDividendInfo;
    static buildDividendManager(fields: any): DividendManager;
    static buildLockCetus(data: any): LockCetus;
    static getAvailableXCetus(veNTF: VeNFT, locks: LockCetus[]): string;
    static getWaitUnLockCetuss(locks: LockCetus[]): LockCetus[];
    static getLockingCetuss(locks: LockCetus[]): LockCetus[];
    static isLocked(lock: LockCetus): boolean;
    static getNextStartTime(dividendManager: DividendManager): Decimal;
}
