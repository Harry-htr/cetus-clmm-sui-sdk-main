import GasConfig from "../../src/utils/gas_config";
export declare const testnet: {
    gasConfig: GasConfig;
    fullRpcUrl: string;
    faucetURL: string;
    faucet: {
        faucet_display: string;
        faucet_router: string;
    };
    simulationAccount: {
        address: string;
    };
    token: {
        token_display: string;
        config: {
            coin_registry_id: string;
            pool_registry_id: string;
            coin_list_owner: string;
            pool_list_owner: string;
        };
    };
    clmm: {
        clmm_display: string;
        clmm_router: {
            cetus: string;
            deepbook: string;
        };
        config: {
            pools_id: string;
            global_config_id: string;
            global_vault_id: string;
        };
    };
    launchpad: {
        ido_display: string;
        ido_router: string;
        config_display: string;
        config: {
            pools_id: string;
            admin_cap_id: string;
            config_cap_id: string;
            config_pools_id: string;
        };
    };
    xcetus: {
        xcetus_display: string;
        xcetus_router: string;
        dividends_display: string;
        dividends_router: string;
        cetus_faucet: string;
        config: {
            xcetus_manager_id: string;
            lock_manager_id: string;
            lock_handle_id: string;
            dividend_manager_id: string;
        };
    };
    booster: {
        booster_display: string;
        booster_router: string;
        config: {
            booster_config_id: string;
            booster_pool_handle: string;
        };
    };
    maker_bonus: {
        maker_display: string;
        maker_router: string;
        config: {
            maker_config_id: string;
            maker_pool_handle: string;
        };
    };
};
