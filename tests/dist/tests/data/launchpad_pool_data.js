"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenList = exports.creatPoolList = void 0;
const numbers_1 = require("../../src/utils/numbers");
const init_test_data_1 = require("./init_test_data");
// least_raise_amount < softcap < hardcap
exports.creatPoolList = [
    {
        coin_type_sale: `${init_test_data_1.faucetObjectId}::usdt::USDT`,
        coin_type_raise: `${init_test_data_1.faucetObjectId}::usdc::USDC`,
        sale_decimals: 6,
        raise_decimals: 6,
        initialize_price: 1.1,
        sale_total: 10 * 1000000,
        min_purchase: 1000000,
        max_purchase: 30000000,
        least_raise_amount: 3000000,
        softcap: 4000000,
        hardcap: 28000000,
        liquidity_rate: 0.5,
        start_time: Number((0, numbers_1.d)(Date.now() / 1000).toFixed(0)) + 1 * 60 * 60,
        activity_duration: 1 * 60 * 60,
        settle_duration: 6 * 60 * 60,
        locked_duration: 2 * 60,
        tick_spacing: 2,
        recipient: "",
        white_config: {
            user_addrs: [],
            each_safe_cap: 0,
            hard_cap_total: 0
        },
        hasCreat: true,
    },
];
exports.tokenList = [
    {
        address: '0x2::sui::SUI',
        coingecko_id: '',
        decimals: 9,
        logo_url: 'https://archive.cetus.zone/assets/image/icon_sui.png',
        name: 'SUI Token',
        official_symbol: 'SUI',
        project_url: '',
        symbol: 'SUI'
    },
    {
        address: '0x6740d70296035d0345bed636a820af129f6ed422::eth::ETH',
        coingecko_id: 'weth',
        decimals: 8,
        logo_url: 'https://app.cetus.zone/image/coins/eth.png',
        name: 'Ethereum',
        official_symbol: 'ETH',
        project_url: '',
        symbol: 'ETH'
    },
    {
        address: '0x6740d70296035d0345bed636a820af129f6ed422::btc::BTC',
        coingecko_id: 'wrapped-bitcoin',
        decimals: 8,
        logo_url: 'https://app.cetus.zone/image/coins/btc.png',
        name: 'Bitcoin',
        official_symbol: 'BTC',
        project_url: '',
        symbol: 'BTC'
    },
    {
        address: '0x6740d70296035d0345bed636a820af129f6ed422::usdt::USDT',
        coingecko_id: 'tether',
        decimals: 6,
        logo_url: 'https://app.cetus.zone/image/coins/usdt.png',
        name: 'Tether USD',
        official_symbol: 'USDT',
        project_url: '',
        symbol: 'USDT'
    },
    {
        address: '0x6740d70296035d0345bed636a820af129f6ed422::usdc::USDC',
        coingecko_id: 'usd-coin',
        decimals: 6,
        logo_url: 'https://app.cetus.zone/image/coins/usdc.png',
        name: 'USD Coin',
        official_symbol: 'USDC',
        project_url: 'test',
        symbol: 'USDC'
    }
];
