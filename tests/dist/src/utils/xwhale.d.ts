import Decimal from 'decimal.js';
import { DividendManager, LockWhale, VeNFT, VeNFTDividendInfo } from '../types/xwhale_type';
export declare class XWhaleUtil {
    static buildVeNFTDividendInfo(fields: any): VeNFTDividendInfo;
    static buildDividendManager(fields: any): DividendManager;
    static buildLockWhale(data: any): LockWhale;
    static getAvailableXWhale(veNTF: VeNFT, locks: LockWhale[]): string;
    static getWaitUnLockWhales(locks: LockWhale[]): LockWhale[];
    static getLockingWhales(locks: LockWhale[]): LockWhale[];
    static isLocked(lock: LockWhale): boolean;
    static getNextStartTime(dividendManager: DividendManager): Decimal;
}
