"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_test_data_1 = require("./data/init_test_data");
const sdk = (0, init_test_data_1.buildSdk)();
// =======  测试获取 token 和 pool ========
const tokenConfig = sdk.sdkOptions.token.config;
// Fetch  all tokens
const tokenList = sdk.Token.getAllRegisteredTokenList();
console.log('token: ', tokenList);

