"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultSuiInputType = exports.PoolLiquidityCoinType = exports.CoinStoreAddress = exports.CoinInfoAddress = exports.ClmmFetcherModule = exports.ClmmIntegrateRouterModule = exports.ClmmIntegratePoolModule = exports.CLOCK_ADDRESS = void 0;
exports.CLOCK_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000006';
exports.ClmmIntegratePoolModule = 'pool_script';
exports.ClmmIntegrateRouterModule = 'router_script';
exports.ClmmFetcherModule = 'fetcher_script';
exports.CoinInfoAddress = '0x1::coin::CoinInfo';
exports.CoinStoreAddress = '0x1::coin::CoinStore';
exports.PoolLiquidityCoinType = 'PoolLiquidityCoin';
const getDefaultSuiInputType = (value) => {
    if (typeof value === 'string' && value.startsWith('0x')) {
        return 'object';
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
        return 'u64';
    }
    if (typeof value === 'boolean') {
        return 'bool';
    }
    throw new Error(`Unknown type for value: ${value}`);
};
exports.getDefaultSuiInputType = getDefaultSuiInputType;
