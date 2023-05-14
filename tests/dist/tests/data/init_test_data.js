"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccount = exports.buildTestAccount = exports.buildTestPosition = exports.buildTestPool = exports.buildSdk = exports.mintAll = exports.TokensMapping = exports.position_object_id = exports.faucetObjectId = void 0;
const sui_js_1 = require("@mysten/sui.js");
const src_1 = require("../../src");
const sdk_1 = require("../../src/sdk");
const config_1 = require("./config");
const sdkEnv = (0, config_1.buildSdkOptions)();
exports.faucetObjectId = sdkEnv.faucet.faucet_display;
const clmm_display = sdkEnv.clmm.clmm_display;
exports.position_object_id = '0x74055642637856f8e8ea2a9724be86250a4fa2b87969ba663aabfcf4c99db33c';
exports.TokensMapping = {
    SUI: {
        address: '0x2::sui::SUI',
        decimals: 8,
    },
    USDC: {
        address: `${exports.faucetObjectId}::usdc::USDC`,
        decimals: 8,
    },
    USDT: {
        address: `${exports.faucetObjectId}::usdt::USDT`,
        decimals: 8,
    },
    USDT_USDC_LP: {
        address: `${clmm_display}::pool::Pool<${exports.faucetObjectId}::usdt::USDC, ${exports.faucetObjectId}::usdc::USDT>`,
        decimals: 8,
        poolObjectId: ['0x6e20639f49444fa8ff6012ce3f7b6064517c0ad7bda5730a0557ad1b1bded372'],
    },
};
function mintAll(sdk, sendKeypair, faucet, funName) {
    return __awaiter(this, void 0, void 0, function* () {
        const objects = yield sdk.fullClient.getObject({ id: faucet.faucet_display, options: { showPreviousTransaction: true } });
        const previousTx = (0, sui_js_1.getObjectPreviousTransactionDigest)(objects);
        console.log("previousTx", previousTx);
        if (previousTx) {
            const txResult = yield sdk.Resources.getSuiTransactionResponse(previousTx);
            if (txResult) {
                const faucetCoins = src_1.CoinAssist.getFaucetCoins(txResult);
                console.log("faucetCoins: ", faucetCoins);
                const tx = new sui_js_1.TransactionBlock();
                const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
                faucetCoins.forEach((coin) => {
                    tx.moveCall({
                        target: `${faucet.faucet_router}::${coin.transactionModule}::${funName}`,
                        typeArguments: [],
                        arguments: [tx.object(coin.suplyID)],
                    });
                });
                tx.setGasBudget(30000000);
                const result = yield (0, src_1.sendTransaction)(signer, tx);
                console.log("result: ", result);
            }
        }
    });
}
exports.mintAll = mintAll;
function buildSdk() {
    const sdk = new sdk_1.SDK(sdkEnv);
    sdk.gasConfig = sdkEnv.gasConfig;
    console.log(`currSdkEnv: ${config_1.currSdkEnv} ; fullRpcUrl: ${sdk.sdkOptions.fullRpcUrl}`);
    return sdk;
}
exports.buildSdk = buildSdk;
function buildTestPool(sdk, poolObjectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield sdk.Resources.getPool(poolObjectId);
        console.log('buildPool: ', pool);
        return pool;
    });
}
exports.buildTestPool = buildTestPool;
function buildTestPosition(sdk, posObjectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const position = yield sdk.Resources.getSipmlePosition(posObjectId);
        console.log('buildTestPosition: ', position);
        return position;
    });
}
exports.buildTestPosition = buildTestPosition;
// 0xcd0247d0b67e53dde69b285e7a748e3dc390e8a5244eb9dd9c5c53d95e4cf0aa
function buildTestAccount() {
    const mnemonics = 'jelly chapter top canoe prize borrow eagle cushion purchase prevent dove sock';
    const testAccountObject = sui_js_1.Ed25519Keypair.deriveKeypair(mnemonics);
    console.log(' Address: ', testAccountObject.getPublicKey().toSuiAddress());
    return testAccountObject;
}
exports.buildTestAccount = buildTestAccount;
function generateAccount() {
    const keypair = sui_js_1.Ed25519Keypair.generate();
    console.log('new Address: ', keypair.getPublicKey().toSuiAddress());
    console.log('keypair: ', keypair.export());
    return keypair;
}
exports.generateAccount = generateAccount;
