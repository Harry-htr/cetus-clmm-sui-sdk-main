import { Ed25519Keypair } from '@mysten/sui.js';
import { SDK } from '../../src/sdk';
export declare const faucetObjectId: string;
export declare const position_object_id = "0x74055642637856f8e8ea2a9724be86250a4fa2b87969ba663aabfcf4c99db33c";
export declare const TokensMapping: {
    SUI: {
        address: string;
        decimals: number;
    };
    USDC: {
        address: string;
        decimals: number;
    };
    USDT: {
        address: string;
        decimals: number;
    };
    USDT_USDC_LP: {
        address: string;
        decimals: number;
        poolObjectId: string[];
    };
};
export declare function mintAll(sdk: SDK, sendKeypair: Ed25519Keypair, faucet: {
    faucet_display: string;
    faucet_router: string;
}, funName: string): Promise<void>;
export declare function buildSdk(): SDK;
export declare function buildTestPool(sdk: SDK, poolObjectId: string): Promise<import("../../src/modules/resourcesModule").Pool>;
export declare function buildTestPosition(sdk: SDK, posObjectId: string): Promise<import("../../src/modules/resourcesModule").Position>;
export declare function buildTestAccount(): Ed25519Keypair;
export declare function generateAccount(): Ed25519Keypair;
