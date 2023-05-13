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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionUtil = exports.printTransaction = exports.sendTransaction = exports.findAdjustCoin = void 0;
/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const CoinAssist_1 = require("../math/CoinAssist");
const sui_1 = require("../types/sui");
const index_1 = require("../index");
function findAdjustCoin(coinPair) {
    const isAdjustCoinA = CoinAssist_1.CoinAssist.isSuiCoin(coinPair.coinTypeA);
    const isAdjustCoinB = CoinAssist_1.CoinAssist.isSuiCoin(coinPair.coinTypeB);
    return { isAdjustCoinA, isAdjustCoinB };
}
exports.findAdjustCoin = findAdjustCoin;
function sendTransaction(signer, tx, onlyCalculateGas = false) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log('gasConfig: ', tx.blockData.gasConfig)
            if (onlyCalculateGas) {
                tx.setSender(yield signer.getAddress());
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                const gasAmount = yield TransactionUtil.calculationTxGas(signer, tx);
                console.log('need gas : ', gasAmount);
                return undefined;
            }
            const resultTxn = yield signer.signAndExecuteTransactionBlock({
                transactionBlock: tx,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            return (0, sui_js_1.getTransactionEffects)(resultTxn);
        }
        catch (error) {
            console.log('error: ', error);
        }
        return undefined;
    });
}
exports.sendTransaction = sendTransaction;
function printTransaction(tx) {
    return __awaiter(this, void 0, void 0, function* () {
        tx.blockData.transactions.forEach((item, index) => {
            console.log(`transaction ${index}: `, item);
        });
    });
}
exports.printTransaction = printTransaction;
class TransactionUtil {
    /**
     * adjust transaction for gas
     * @param sdk
     * @param amount
     * @param tx
     * @returns
     */
    static adjustTransactionForGas(sdk, allCoins, amount, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            tx.setSender(sdk.senderAddress);
            // amount coins
            const amountCoins = CoinAssist_1.CoinAssist.selectCoinAssetGreaterThanOrEqual(allCoins, amount).selectedCoins;
            if (amountCoins.length === 0) {
                throw new Error(`Insufficient balance`);
            }
            // If the remaining coin balance is greater than GasBudgetHigh2 * 2, no gas fee correction will be done
            if (CoinAssist_1.CoinAssist.calculateTotalBalance(allCoins) - CoinAssist_1.CoinAssist.calculateTotalBalance(amountCoins) > sdk.gasConfig.GasBudgetHigh2 * 2) {
                return { fixAmount: amount };
            }
            // payload Estimated gas consumption
            const estimateGas = yield TransactionUtil.calculationTxGas(sdk.fullClient, tx);
            console.log('estimateGas: ', estimateGas);
            // Find estimateGas objectIds
            const gasCoins = CoinAssist_1.CoinAssist.selectCoinAssetGreaterThanOrEqual(allCoins, BigInt(estimateGas), amountCoins.map((item) => item.coinObjectId)).selectedCoins;
            // There is not enough gas and the amount needs to be adjusted
            if (gasCoins.length === 0) {
                // Readjust the amount , Reserve 500 gas for the spit
                amount -= BigInt(500);
                amount -= BigInt(estimateGas);
                if (amount < 0) {
                    throw new Error(`gas Insufficient balance`);
                }
                const newTx = new sui_js_1.TransactionBlock();
                const primaryCoinAInput = newTx.splitCoins(newTx.gas, [newTx.pure(amount)]);
                newTx.setGasBudget(estimateGas + 500);
                return { fixAmount: amount, fixCoinInput: newTx.makeMoveVec({ objects: [primaryCoinAInput] }), newTx };
            }
            return { fixAmount: amount };
        });
    }
    // -----------------------------------------liquidity-----------------------------------------------
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildAddLiquidityTransactionForGas(sdk, allCoins, params, gasEstimateArg) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let tx = yield TransactionUtil.buildAddLiquidityTransaction(sdk, allCoins, params);
            const { isAdjustCoinA } = findAdjustCoin(params);
            const suiAmount = isAdjustCoinA ? params.amount_a : params.amount_b;
            const newResult = yield TransactionUtil.adjustTransactionForGas(sdk, CoinAssist_1.CoinAssist.getCoinAssets(isAdjustCoinA ? params.coinTypeA : params.coinTypeB, allCoins), BigInt(suiAmount), tx);
            const { fixAmount } = newResult;
            const { fixCoinInput } = newResult;
            const { newTx } = newResult;
            if (fixCoinInput !== undefined && newTx !== undefined) {
                let primaryCoinAInputs;
                let primaryCoinBInputs;
                if (isAdjustCoinA) {
                    params.amount_a = Number(fixAmount);
                    primaryCoinAInputs = fixCoinInput;
                    primaryCoinBInputs = (_a = TransactionUtil.buildCoinInputForAmount(newTx, allCoins, BigInt(params.amount_b), params.coinTypeB)) === null || _a === void 0 ? void 0 : _a.transactionArgument;
                }
                else {
                    params.amount_b = Number(fixAmount);
                    primaryCoinAInputs = (_b = TransactionUtil.buildCoinInputForAmount(newTx, allCoins, BigInt(params.amount_a), params.coinTypeA)) === null || _b === void 0 ? void 0 : _b.transactionArgument;
                    primaryCoinBInputs = fixCoinInput;
                    params = TransactionUtil.fixAddLiquidityFixTokenParams(params, gasEstimateArg.slippage, gasEstimateArg.curSqrtPrice);
                    tx = TransactionUtil.buildAddLiquidityFixTokenArgs(newTx, sdk.sdkOptions, params, primaryCoinAInputs, primaryCoinBInputs);
                    return tx;
                }
            }
            return tx;
        });
    }
    /**
     * build add liquidity transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildAddLiquidityTransaction(sdk, allCoinAsset, params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const isFixToken = !('delta_liquidity' in params);
            let tx = new sui_js_1.TransactionBlock();
            const primaryCoinAInputs = (_a = TransactionUtil.buildCoinInputForAmount(tx, allCoinAsset, BigInt(isFixToken ? params.amount_a : params.max_amount_a), params.coinTypeA)) === null || _a === void 0 ? void 0 : _a.transactionArgument;
            const primaryCoinBInputs = (_b = TransactionUtil.buildCoinInputForAmount(tx, allCoinAsset, BigInt(isFixToken ? params.amount_b : params.max_amount_b), params.coinTypeB)) === null || _b === void 0 ? void 0 : _b.transactionArgument;
            if (isFixToken) {
                tx.setGasBudget(sdk.gasConfig.GasBudgetHigh2);
                tx = TransactionUtil.buildAddLiquidityFixTokenArgs(tx, sdk.sdkOptions, params, primaryCoinAInputs, primaryCoinBInputs);
            }
            else {
                tx.setGasBudget(sdk.gasConfig.GasBudgetLow);
                tx = TransactionUtil.buildAddLiquidityArgs(tx, sdk.sdkOptions, params, primaryCoinAInputs, primaryCoinBInputs);
            }
            return tx;
        });
    }
    /**
     * fix add liquidity fix token for coin amount
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static fixAddLiquidityFixTokenParams(params, slippage, curSqrtPrice) {
        const coinAmount = params.fix_amount_a ? params.amount_a : params.amount_b;
        const liquidityInput = index_1.ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(Number(params.tick_lower), Number(params.tick_upper), new bn_js_1.default(coinAmount), params.fix_amount_a, true, slippage, curSqrtPrice);
        params.amount_a = params.fix_amount_a ? params.amount_a : liquidityInput.tokenMaxA.toNumber();
        params.amount_b = params.fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : params.amount_b;
        return params;
    }
    static buildAddLiquidityFixTokenArgs(tx, sdkOptions, params, primaryCoinAInputs, primaryCoinBInputs) {
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        let functionName = 'add_liquidity_fix_coin_with_all';
        const { clmm } = sdkOptions;
        const primaryCoinInputs = [];
        if (primaryCoinAInputs) {
            primaryCoinInputs.push({
                coinInput: primaryCoinAInputs,
                coinAmount: params.amount_a.toString(),
            });
        }
        if (primaryCoinBInputs) {
            primaryCoinInputs.push({
                coinInput: primaryCoinBInputs,
                coinAmount: params.amount_b.toString(),
            });
        }
        const isWithAll = primaryCoinInputs.length === 2;
        if (isWithAll) {
            functionName = params.is_open ? 'open_position_with_liquidity_with_all' : 'add_liquidity_fix_coin_with_all';
        }
        else {
            functionName = params.is_open
                ? primaryCoinAInputs !== undefined
                    ? 'open_position_with_liquidity_only_a'
                    : 'open_position_with_liquidity_only_b'
                : primaryCoinAInputs !== undefined
                    ? 'add_liquidity_fix_coin_only_a'
                    : 'add_liquidity_fix_coin_only_b';
        }
        const args = params.is_open
            ? isWithAll
                ? [
                    tx.pure(clmm.config.global_config_id),
                    tx.pure(params.pool_id),
                    tx.pure((0, index_1.asUintN)(BigInt(params.tick_lower)).toString()),
                    tx.pure((0, index_1.asUintN)(BigInt(params.tick_upper)).toString()),
                    ...primaryCoinInputs.map((item) => item.coinInput),
                    ...primaryCoinInputs.map((item) => tx.pure(item.coinAmount)),
                    tx.pure(params.fix_amount_a),
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ]
                : [
                    tx.pure(clmm.config.global_config_id),
                    tx.pure(params.pool_id),
                    tx.pure((0, index_1.asUintN)(BigInt(params.tick_lower)).toString()),
                    tx.pure((0, index_1.asUintN)(BigInt(params.tick_upper)).toString()),
                    ...primaryCoinInputs.map((item) => item.coinInput),
                    ...primaryCoinInputs.map((item) => tx.pure(item.coinAmount)),
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ]
            : isWithAll
                ? [
                    tx.pure(clmm.config.global_config_id),
                    tx.pure(params.pool_id),
                    tx.pure(params.pos_id),
                    ...primaryCoinInputs.map((item) => item.coinInput),
                    ...primaryCoinInputs.map((item) => tx.pure(item.coinAmount)),
                    tx.pure(params.fix_amount_a),
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ]
                : [
                    tx.pure(clmm.config.global_config_id),
                    tx.pure(params.pool_id),
                    tx.pure(params.pos_id),
                    ...primaryCoinInputs.map((item) => item.coinInput),
                    ...primaryCoinInputs.map((item) => tx.pure(item.coinAmount)),
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ];
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    static buildAddLiquidityArgs(tx, sdkOptions, params, primaryCoinAInputs, primaryCoinBInputs) {
        var _a, _b;
        const { clmm } = sdkOptions;
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        let functionName = 'add_liquidity_with_all';
        let args;
        const primaryCoinInputs = [];
        if (primaryCoinAInputs) {
            primaryCoinInputs.push(primaryCoinAInputs);
        }
        if (primaryCoinBInputs) {
            primaryCoinInputs.push(primaryCoinBInputs);
        }
        if (primaryCoinInputs.length === 2) {
            functionName = 'add_liquidity_with_all';
        }
        else {
            functionName = primaryCoinAInputs !== undefined ? 'add_liquidity_only_a' : 'add_liquidity_only_b';
        }
        if (primaryCoinAInputs !== undefined && primaryCoinBInputs !== undefined) {
            functionName = 'add_liquidity_with_all';
            args = [
                tx.pure((_a = clmm.config) === null || _a === void 0 ? void 0 : _a.global_config_id),
                tx.pure(params.pool_id),
                tx.pure(params.pos_id),
                primaryCoinAInputs,
                primaryCoinBInputs,
                tx.pure(params.max_amount_a.toString()),
                tx.pure(params.max_amount_b.toString()),
                tx.pure(params.delta_liquidity),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ];
        }
        else {
            args = [
                tx.pure((_b = clmm.config) === null || _b === void 0 ? void 0 : _b.global_config_id),
                tx.pure(params.pool_id),
                tx.pure(params.pos_id),
                primaryCoinAInputs !== undefined ? primaryCoinAInputs : primaryCoinBInputs,
                tx.pure(params.max_amount_a.toString()),
                tx.pure(params.max_amount_b.toString()),
                tx.pure(params.delta_liquidity),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ];
        }
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    // -------------------------------------swap--------------------------------------------------//
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildSwapTransactionForGas(sdk, params, allCoinAsset, gasEstimateArg) {
        return __awaiter(this, void 0, void 0, function* () {
            let tx = TransactionUtil.buildSwapTransaction(sdk, params, allCoinAsset);
            const newResult = yield TransactionUtil.adjustTransactionForGas(sdk, CoinAssist_1.CoinAssist.getCoinAssets(params.a2b ? params.coinTypeA : params.coinTypeB, allCoinAsset), BigInt(params.by_amount_in ? params.amount : params.amount_limit), tx);
            const { fixAmount, fixCoinInput, newTx } = newResult;
            if (fixCoinInput !== undefined && newTx !== undefined) {
                if (params.by_amount_in) {
                    params.amount = fixAmount.toString();
                }
                else {
                    params.amount_limit = fixAmount.toString();
                }
                params = TransactionUtil.fixSwapParams(sdk, params, gasEstimateArg);
                tx = TransactionUtil.buildSwapTransactionArgs(newTx, params, sdk.sdkOptions, fixCoinInput);
            }
            return tx;
        });
    }
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransaction(sdk, params, allCoinAsset) {
        var _a;
        let tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(sdk.gasConfig.GasBudgetHigh2);
        const primaryCoinInputs = (_a = TransactionUtil.buildCoinInputForAmount(tx, allCoinAsset, BigInt(params.by_amount_in ? params.amount : params.amount_limit), params.a2b ? params.coinTypeA : params.coinTypeB)) === null || _a === void 0 ? void 0 : _a.transactionArgument;
        tx = TransactionUtil.buildSwapTransactionArgs(tx, params, sdk.sdkOptions, primaryCoinInputs);
        return tx;
    }
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionArgs(tx, params, sdkOptions, primaryCoinInput) {
        var _a;
        const { clmm } = sdkOptions;
        const sqrtPriceLimit = index_1.SwapUtils.getDefaultSqrtPriceLimit(params.a2b);
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const global_config_id = (_a = clmm.config) === null || _a === void 0 ? void 0 : _a.global_config_id;
        if (global_config_id === undefined) {
            throw Error('clmm.config.global_config_id is undefined');
        }
        const hasSwapPartner = params.swap_partner !== undefined;
        const functionName = hasSwapPartner
            ? params.a2b
                ? 'swap_a2b_with_partner'
                : 'swap_b2a_with_partner'
            : params.a2b
                ? 'swap_a2b'
                : 'swap_b2a';
        const args = hasSwapPartner
            ? [
                tx.pure(global_config_id),
                tx.pure(params.pool_id),
                tx.pure(params.swap_partner),
                primaryCoinInput,
                tx.pure(params.by_amount_in),
                tx.pure(params.amount),
                tx.pure(params.amount_limit),
                tx.pure(sqrtPriceLimit.toString()),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ]
            : [
                tx.pure(global_config_id),
                tx.pure(params.pool_id),
                primaryCoinInput,
                tx.pure(params.by_amount_in),
                tx.pure(params.amount),
                tx.pure(params.amount_limit),
                tx.pure(sqrtPriceLimit.toString()),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ];
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    static fixSwapParams(sdk, params, gasEstimateArg) {
        const res = sdk.Swap.calculateRates({
            decimalsA: gasEstimateArg.decimalsA,
            decimalsB: gasEstimateArg.decimalsB,
            a2b: params.a2b,
            byAmountIn: params.by_amount_in,
            amount: new bn_js_1.default(params.amount),
            swapTicks: gasEstimateArg.swapTicks,
            currentPool: gasEstimateArg.currentPool,
        });
        const toAmount = gasEstimateArg.byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn;
        const amountLimit = (0, index_1.adjustForSlippage)(toAmount, gasEstimateArg.slippage, !gasEstimateArg.byAmountIn);
        params.amount_limit = amountLimit.toString();
        return params;
    }
    static syncBuildCoinInputForAmount(sdk, tx, amount, coinType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const allCoins = yield sdk.Resources.getOwnerCoinAssets(sdk.senderAddress, coinType);
            const primaryCoinInput = TransactionUtil.buildCoinInputForAmount(tx, allCoins, amount, coinType).transactionArgument;
            return primaryCoinInput;
        });
    }
    static buildCoinInputForAmount(tx, allCoins, amount, coinType, buildVector = true) {
        const coinAssets = CoinAssist_1.CoinAssist.getCoinAssets(coinType, allCoins);
        if (amount === BigInt(0)) {
            return undefined;
        }
        // console.log(coinAssets)
        const amountTotal = CoinAssist_1.CoinAssist.calculateTotalBalance(coinAssets);
        if (amountTotal < amount) {
            throw new Error(`The amount(${amountTotal}) is Insufficient balance for ${coinType} , expect ${amount} `);
        }
        if (CoinAssist_1.CoinAssist.isSuiCoin(coinType)) {
            const amountCoin = tx.splitCoins(tx.gas, [tx.pure(amount.toString())]);
            if (buildVector) {
                return {
                    transactionArgument: tx.makeMoveVec({ objects: [amountCoin] }),
                    remainCoins: allCoins,
                };
            }
            return {
                transactionArgument: amountCoin,
                remainCoins: allCoins,
            };
        }
        const selectedCoinsResult = CoinAssist_1.CoinAssist.selectCoinObjectIdGreaterThanOrEqual(coinAssets, amount);
        const coinObjectIds = selectedCoinsResult.objectArray;
        if (buildVector) {
            return {
                transactionArgument: tx.makeMoveVec({ objects: coinObjectIds.map((id) => tx.object(id)) }),
                remainCoins: selectedCoinsResult.remainCoins,
            };
        }
        const [primaryCoinA, ...mergeCoinAs] = coinObjectIds;
        const primaryCoinAInput = tx.object(primaryCoinA);
        if (mergeCoinAs.length > 0) {
            tx.mergeCoins(primaryCoinAInput, mergeCoinAs.map((coin) => tx.object(coin)));
        }
        return {
            transactionArgument: primaryCoinAInput,
            remainCoins: selectedCoinsResult.remainCoins,
        };
    }
    static calculationTxGas(sdk, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sender } = tx.blockData;
            if (sender === undefined) {
                throw Error('sender is empty');
            }
            const devResult = yield sdk.devInspectTransactionBlock({
                transactionBlock: tx,
                sender,
            });
            const { gasUsed } = devResult.effects;
            const estimateGas = Number(gasUsed.computationCost) + Number(gasUsed.storageCost) - Number(gasUsed.storageRebate);
            return estimateGas;
        });
    }
    // -------------------------------------router--------------------------------------------------//
    static buildRouterSwapTransaction(sdk, params, byAmountIn, allCoinAsset) {
        var _a;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(sdk.gasConfig.GasBudgetHigh3);
        const { clmm } = sdk.sdkOptions;
        const global_config_id = (_a = clmm.config) === null || _a === void 0 ? void 0 : _a.global_config_id;
        let coinAssets = allCoinAsset;
        for (let i = 0; i < params.paths.length; i += 1) {
            if (params.paths[i].poolAddress.length === 1) {
                const swapParams = {
                    pool_id: params.paths[i].poolAddress[0],
                    a2b: params.paths[i].a2b[0],
                    byAmountIn,
                    amount: byAmountIn ? params.paths[i].amountIn.toString() : params.paths[i].amountOut.toString(),
                    amount_limit: (0, index_1.adjustForSlippage)(new bn_js_1.default(params.paths[i].rawAmountLimit[0]), index_1.Percentage.fromDecimal((0, index_1.d)(params.priceSplitPoint)), !byAmountIn).toString(),
                    swap_partner: '',
                    coinTypeA: params.paths[i].coinType[0],
                    coinTypeB: params.paths[i].coinType[1],
                };
                const buildCoinResult = TransactionUtil.buildCoinInputForAmount(tx, coinAssets, BigInt(byAmountIn ? params.paths[i].amountIn.toString() : swapParams.amount_limit), swapParams.coinTypeA);
                const primaryCoinInput = buildCoinResult === null || buildCoinResult === void 0 ? void 0 : buildCoinResult.transactionArgument;
                coinAssets = buildCoinResult.remainCoins;
                const functionName = swapParams.a2b ? 'swap_a2b' : 'swap_b2a';
                const sqrtPriceLimit = index_1.SwapUtils.getDefaultSqrtPriceLimit(swapParams.a2b);
                const args = [
                    tx.object(global_config_id),
                    tx.object(swapParams.pool_id),
                    primaryCoinInput,
                    tx.pure(byAmountIn),
                    tx.pure(swapParams.amount),
                    tx.pure(swapParams.amount_limit),
                    tx.pure(sqrtPriceLimit.toString()),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ];
                const typeArguments = swapParams.a2b ? [swapParams.coinTypeA, swapParams.coinTypeB] : [swapParams.coinTypeB, swapParams.coinTypeA];
                tx.moveCall({
                    target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::${functionName}`,
                    typeArguments,
                    arguments: args,
                });
            }
            else {
                const amount_0 = byAmountIn ? params.paths[i].amountIn : params.paths[i].rawAmountLimit[0];
                const amount_1 = byAmountIn ? params.paths[i].rawAmountLimit[0] : params.paths[i].amountOut;
                const swapParams = {
                    pool_0_id: params.paths[i].poolAddress[0],
                    pool_1_id: params.paths[i].poolAddress[1],
                    a2b_0: params.paths[i].a2b[0],
                    a2b_1: params.paths[i].a2b[1],
                    byAmountIn,
                    amount_0,
                    amount_1,
                    amount_limit_0: (0, index_1.adjustForSlippage)(new bn_js_1.default(params.paths[i].rawAmountLimit[0]), index_1.Percentage.fromDecimal((0, index_1.d)(params.priceSplitPoint)), !byAmountIn).toString(),
                    amount_limit_1: (0, index_1.adjustForSlippage)(new bn_js_1.default(params.paths[i].rawAmountLimit[1]), index_1.Percentage.fromDecimal((0, index_1.d)(params.priceSplitPoint)), !byAmountIn).toString(),
                    swap_partner: '',
                    coinTypeA: params.paths[i].coinType[0],
                    coinTypeB: params.paths[i].coinType[1],
                    coinTypeC: params.paths[i].coinType[2],
                };
                const buildCoinResult = TransactionUtil.buildCoinInputForAmount(tx, coinAssets, BigInt(byAmountIn ? swapParams.amount_0.toString() : swapParams.amount_limit_0), swapParams.coinTypeA);
                const primaryCoinInput = buildCoinResult === null || buildCoinResult === void 0 ? void 0 : buildCoinResult.transactionArgument;
                coinAssets = buildCoinResult.remainCoins;
                let functionName = '';
                if (swapParams.a2b_0) {
                    if (swapParams.a2b_1) {
                        functionName = 'router_swap_ab_bc_in_a';
                    }
                    else {
                        functionName = 'router_swap_ab_cb_in_a';
                    }
                }
                else if (swapParams.a2b_1) {
                    functionName = 'router_swap_ba_bc_in_a';
                }
                else {
                    functionName = 'router_swap_ba_cb_in_a';
                }
                const sqrtPriceLimit0 = index_1.SwapUtils.getDefaultSqrtPriceLimit(params.paths[i].a2b[0]);
                const sqrtPriceLimit1 = index_1.SwapUtils.getDefaultSqrtPriceLimit(params.paths[i].a2b[1]);
                const args = [
                    tx.object(global_config_id),
                    tx.object(swapParams.pool_0_id),
                    tx.object(swapParams.pool_1_id),
                    primaryCoinInput,
                    tx.pure(byAmountIn),
                    tx.pure(swapParams.amount_0.toString()),
                    tx.pure(swapParams.amount_1.toString()),
                    tx.pure(swapParams.amount_limit_0),
                    tx.pure(swapParams.amount_limit_1),
                    tx.pure(sqrtPriceLimit0.toString()),
                    tx.pure(sqrtPriceLimit1.toString()),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ];
                const typeArguments = [swapParams.coinTypeA, swapParams.coinTypeB, swapParams.coinTypeC];
                tx.moveCall({
                    target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegrateRouterModule}::${functionName}`,
                    typeArguments,
                    arguments: args,
                });
            }
        }
        return tx;
    }
    static buildCoinTypePair(coinTypes, partitionQuantities) {
        const coinTypePair = [];
        if (coinTypes.length === 2) {
            const pair = [];
            pair.push(coinTypes[0], coinTypes[1]);
            coinTypePair.push(pair);
        }
        else {
            const directPair = [];
            directPair.push(coinTypes[0], coinTypes[coinTypes.length - 1]);
            coinTypePair.push(directPair);
            for (let i = 1; i < coinTypes.length - 1; i += 1) {
                if (partitionQuantities[i - 1] === 0) {
                    continue;
                }
                const pair = [];
                pair.push(coinTypes[0], coinTypes[i], coinTypes[coinTypes.length - 1]);
                coinTypePair.push(pair);
            }
        }
        return coinTypePair;
    }
}
exports.TransactionUtil = TransactionUtil;
