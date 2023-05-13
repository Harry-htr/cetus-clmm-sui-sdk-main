import { SuiResource } from '../types/sui';
export declare class CachedContent {
    overdueTime: number;
    value: SuiResource | null;
    constructor(value: SuiResource | null, overdueTime?: number);
    getCacheData(): SuiResource | null;
}
