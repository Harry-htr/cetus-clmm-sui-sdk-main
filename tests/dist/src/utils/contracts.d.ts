import { SuiAddressType, SuiStructTag } from '../types/sui';
export declare function isSortedSymbols(symbolX: string, symbolY: string): boolean;
export declare function composeType(address: string, generics: SuiAddressType[]): SuiAddressType;
export declare function composeType(address: string, struct: string, generics?: SuiAddressType[]): SuiAddressType;
export declare function composeType(address: string, module: string, struct: string, generics?: SuiAddressType[]): SuiAddressType;
export declare function extractAddressFromType(type: string): string;
export declare function extractStructTagFromType(type: string): SuiStructTag;
export declare function checkAptosType(type: any, options?: {
    leadingZero: boolean;
}): boolean;
