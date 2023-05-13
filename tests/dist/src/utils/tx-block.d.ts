import { TransactionBlock } from '@mysten/sui.js';
import { SuiInputTypes, SuiTxArg } from '../types/sui';
export declare class TxBlock {
    txBlock: TransactionBlock;
    constructor();
    transferSuiToMany(recipients: string[], amounts: number[]): this;
    transferSui(recipient: string, amount: number): this;
    transferCoin(recipient: string, amount: number, coinObjectIds: string[]): this;
    transferObjects(objects: SuiTxArg[], recipient: string): this;
    /**
     * @description Move call
     * @param target `${string}::${string}::${string}`, e.g. `0x3::sui_system::request_add_stake`
     * @param args the arguments of the move call, such as `['0x1', '0x2']`
     * @param typeArguments the type arguments of the move call, such as `['0x2::sui::SUI']`
     */
    moveCall(target: string, typeArguments?: string[], args?: any[]): ({
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    } | {
        kind: "GasCoin";
    } | {
        kind: "Result";
        index: number;
    } | {
        kind: "NestedResult";
        index: number;
        resultIndex: number;
    }) & ({
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    } | {
        kind: "GasCoin";
    } | {
        kind: "Result";
        index: number;
    } | {
        kind: "NestedResult";
        index: number;
        resultIndex: number;
    })[];
    address(value: string): {
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    };
    pure(value: any): {
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    };
    object(value: string): {
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    };
    setGasBudget(gasBudget: number): void;
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
    makeMoveVec(args: SuiTxArg[], type?: SuiInputTypes): ({
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    } | {
        kind: "GasCoin";
    } | {
        kind: "Result";
        index: number;
    } | {
        kind: "NestedResult";
        index: number;
        resultIndex: number;
    }) & ({
        kind: "Input";
        index: number;
        type?: "object" | "pure" | undefined;
        value?: any;
    } | {
        kind: "GasCoin";
    } | {
        kind: "Result";
        index: number;
    } | {
        kind: "NestedResult";
        index: number;
        resultIndex: number;
    })[];
    private convertArgs;
}
