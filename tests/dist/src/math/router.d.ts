import BN from 'bn.js';
import { OneStep } from '../modules/routerModule';
export declare function findBestSplitSteps(routerTable: BN[][], feeRateArray: number[], poolAddresses: string[], exceedTable: boolean[][], a2b: boolean[], byAmountIn: boolean): OneStep;
