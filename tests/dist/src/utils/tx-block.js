"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxBlock = void 0;
/* eslint-disable no-template-curly-in-string */
const sui_js_1 = require("@mysten/sui.js");
const sui_1 = require("../types/sui");
class TxBlock {
    constructor() {
        this.txBlock = new sui_js_1.TransactionBlock();
    }
    transferSuiToMany(recipients, amounts) {
        const tx = this.txBlock;
        const coins = tx.splitCoins(tx.gas, amounts.map((amount) => tx.pure(amount)));
        recipients.forEach((recipient, index) => {
            tx.transferObjects([coins[index]], tx.pure(recipient));
        });
        return this;
    }
    transferSui(recipient, amount) {
        return this.transferSuiToMany([recipient], [amount]);
    }
    transferCoin(recipient, amount, coinObjectIds) {
        const tx = this.txBlock;
        const [primaryCoinA, ...mergeCoinAs] = coinObjectIds;
        const primaryCoinAInput = tx.object(primaryCoinA);
        if (mergeCoinAs.length > 0) {
            tx.mergeCoins(primaryCoinAInput, mergeCoinAs.map((coin) => tx.object(coin)));
        }
        const spitAmount = tx.splitCoins(primaryCoinAInput, [tx.pure(amount)]);
        tx.transferObjects([spitAmount], tx.pure(recipient));
        return this;
    }
    transferObjects(objects, recipient) {
        const tx = this.txBlock;
        tx.transferObjects(this.convertArgs(objects), tx.pure(recipient));
        return this;
    }
    /**
     * @description Move call
     * @param target `${string}::${string}::${string}`, e.g. `0x3::sui_system::request_add_stake`
     * @param args the arguments of the move call, such as `['0x1', '0x2']`
     * @param typeArguments the type arguments of the move call, such as `['0x2::sui::SUI']`
     */
    moveCall(target, typeArguments = [], args = []) {
        // a regex for pattern `${string}::${string}::${string}`
        const regex = /(?<package>[a-zA-Z0-9]+)::(?<module>[a-zA-Z0-9_]+)::(?<function>[a-zA-Z0-9_]+)/;
        const match = target.match(regex);
        if (match === null)
            throw new Error('Invalid target format. Expected `${string}::${string}::${string}`');
        const convertedArgs = this.convertArgs(args);
        const tx = this.txBlock;
        return tx.moveCall({
            target: target,
            arguments: convertedArgs,
            typeArguments,
        });
    }
    address(value) {
        return this.txBlock.pure(value);
    }
    pure(value) {
        return this.txBlock.pure(value);
    }
    object(value) {
        return this.txBlock.object(value);
    }
    setGasBudget(gasBudget) {
        this.txBlock.setGasBudget(gasBudget);
    }
    /**
     * Since we know the elements in the array are the same type
     * If type is not provided, we will try to infer the type from the first element
     * By default,
     *
     * string starting with `0x` =====> object id
     * number, bigint ====> u64
     * boolean =====> bool
     *
     *
     * If type is provided, we will use the type to convert the array
     * @param args
     * @param type 'address' | 'bool' | 'u8' | 'u16' | 'u32' | 'u64' | 'u128' | 'u256' | 'object'
     */
    makeMoveVec(args, type) {
        if (args.length === 0)
            throw new Error('Transaction builder error: Empty array is not allowed');
        if (type === 'object' && args.some((arg) => typeof arg !== 'string')) {
            throw new Error('Transaction builder error: Object id must be string');
        }
        const defaultSuiType = (0, sui_1.getDefaultSuiInputType)(args[0]);
        if (type === 'object' || defaultSuiType === 'object') {
            return this.txBlock.makeMoveVec({
                objects: args.map((arg) => this.txBlock.object((0, sui_js_1.normalizeSuiObjectId)(arg))),
            });
        }
        return this.txBlock.makeMoveVec({
            objects: args.map((arg) => this.txBlock.pure(arg)),
        });
    }
    convertArgs(args) {
        return args.map((arg) => {
            // We always treat string starting with `0x` as object id
            if (typeof arg === 'string' && arg.startsWith('0x')) {
                return this.txBlock.object((0, sui_js_1.normalizeSuiObjectId)(arg));
                // Other basic types such as string, number, boolean are converted to pure value
            }
            if (typeof arg !== 'object') {
                return this.txBlock.pure(arg);
                // if it's an array, we will convert it to move vec
            }
            if (Array.isArray(arg)) {
                return this.makeMoveVec(arg);
            }
            // We do nothing, because it's most likely already a move value
            return arg;
        });
    }
}
exports.TxBlock = TxBlock;
