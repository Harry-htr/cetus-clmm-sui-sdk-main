import { JsonRpcProvider } from '@mysten/sui.js';
import { BoosterModule } from './modules/boosterModule';
import { LaunchpadModule } from './modules/launchpadModule';
import { MakerModule } from './modules/makerModule';
import { PoolModule } from './modules/poolModule';
import { PositionModule } from './modules/positionModule';
import { ResourcesModule } from './modules/resourcesModule';
import { RewarderModule } from './modules/rewarderModule';
import { RouterModule } from './modules/routerModule';
import { SwapModule } from './modules/swapModule';
import { TokenModule } from './modules/tokenModule';
import { XCetusModule } from './modules/xcetusModule';
import { SuiObjectIdType } from './types/sui';
import GasConfig from './utils/gas_config';
export type SdkOptions = {
    fullRpcUrl: string;
    faucetURL: string;
    simulationAccount: {
        address: string;
    };
    token: {
        token_display: SuiObjectIdType;
        config: {
            coin_registry_id: SuiObjectIdType;
            coin_list_owner: SuiObjectIdType;
            pool_registry_id: SuiObjectIdType;
            pool_list_owner: SuiObjectIdType;
        };
    };
    launchpad: {
        ido_display: SuiObjectIdType;
        ido_router: SuiObjectIdType;
        config: {
            pools_id: SuiObjectIdType;
            admin_cap_id: SuiObjectIdType;
            config_cap_id: SuiObjectIdType;
        };
    };
    xcetus: {
        xcetus_display: SuiObjectIdType;
        xcetus_router: SuiObjectIdType;
        dividends_display: SuiObjectIdType;
        dividends_router: SuiObjectIdType;
        cetus_faucet: SuiObjectIdType;
        config: {
            xcetus_manager_id: SuiObjectIdType;
            lock_manager_id: SuiObjectIdType;
            lock_handle_id: SuiObjectIdType;
            dividend_manager_id: SuiObjectIdType;
        };
    };
    booster: {
        booster_display: SuiObjectIdType;
        booster_router: SuiObjectIdType;
        config: {
            booster_config_id: SuiObjectIdType;
            booster_pool_handle: SuiObjectIdType;
        };
    };
    maker_bonus: {
        maker_display: SuiObjectIdType;
        maker_router: SuiObjectIdType;
        config: {
            maker_config_id: SuiObjectIdType;
            maker_pool_handle: SuiObjectIdType;
        };
    };
    clmm: {
        clmm_display: SuiObjectIdType;
        config: {
            global_config_id: SuiObjectIdType;
            global_vault_id: SuiObjectIdType;
            pools_id: SuiObjectIdType;
        };
        clmm_router: {
            cetus: SuiObjectIdType;
            deepbook: SuiObjectIdType;
        };
    };
};
export declare class SDK {
    protected _fullClient: JsonRpcProvider;
    protected _pool: PoolModule;
    protected _position: PositionModule;
    protected _swap: SwapModule;
    protected _resources: ResourcesModule;
    protected _rewarder: RewarderModule;
    protected _router: RouterModule;
    protected _token: TokenModule;
    protected _sdkOptions: SdkOptions;
    protected _launchpad: LaunchpadModule;
    protected _xcetusModule: XCetusModule;
    protected _boosterModule: BoosterModule;
    protected _makerModule: MakerModule;
    protected _senderAddress: string;
    protected _gasConfig: GasConfig;
    constructor(options: SdkOptions);
    get senderAddress(): string;
    set senderAddress(value: string);
    set gasConfig(value: GasConfig);
    get gasConfig(): GasConfig;
    get Swap(): SwapModule;
    get fullClient(): JsonRpcProvider;
    get Resources(): ResourcesModule;
    get sdkOptions(): SdkOptions;
    get Pool(): PoolModule;
    get Position(): PositionModule;
    get Rewarder(): RewarderModule;
    get Router(): RouterModule;
    get Token(): TokenModule;
    get Launchpad(): LaunchpadModule;
    get XCetusModule(): XCetusModule;
    get BoosterModule(): BoosterModule;
    get MakerModule(): MakerModule;
}
