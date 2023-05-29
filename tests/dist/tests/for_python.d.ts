import 'isomorphic-fetch';
export declare const get_token_balance: (token_id: string) => Promise<string>;
export declare const get_token_balances: () => Promise<string>;
export declare const transfer: (token_name: string, objectid: string, num: number, to_address: string) => Promise<string>;
export declare const calculate_pnl_rates: (pool_id: string, decimalsA: number, decimalsB: number, numA: number, numB: number) => Promise<string>;
export declare const swap: (pool_id: string, a2b: boolean, decimalsA: number, decimalsB: number, num: number, slippage_ratio: number) => Promise<string>;
