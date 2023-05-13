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
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
describe('sdk config', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    test('clmmConfig', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const initEvent = yield sdk.Resources.getInitEvent();
            console.log('clmmConfig ', initEvent);
        }
        catch (error) {
            console.log(error);
        }
    }));
    test('tokenConfig', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tokenConfig = yield sdk.Token.getTokenConfigEvent();
            console.log('tokenConfig: ', tokenConfig);
        }
        catch (error) {
            console.log(error);
        }
    }));
    test('launchpadConfig', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const initFactoryEvent = yield sdk.Launchpad.getInitFactoryEvent();
            // const initLockEvent = await sdk.Launchpad.getInitLockEvent()
            console.log('launchpadConfig ', Object.assign({}, initFactoryEvent));
        }
        catch (error) {
            console.log(error);
        }
    }));
    test('xcetusConfig', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const initFactoryEvent = yield sdk.XCetusModule.getInitFactoryEvent();
            const lockUpManagerEvent = yield sdk.XCetusModule.getLockUpManagerEvent();
            const dividendManagerEvent = yield sdk.XCetusModule.getDividendManagerEvent();
            console.log(Object.assign(Object.assign({}, initFactoryEvent), { lock_manager_id: lockUpManagerEvent.lock_manager_id, lock_handle_id: lockUpManagerEvent.lock_handle_id, dividend_manager_id: dividendManagerEvent.dividend_manager_id }));
        }
        catch (error) {
            console.log(error);
        }
    }));
    test('boosteConfig', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const initFactoryEvent = yield sdk.BoosterModule.getInitFactoryEvent();
            console.log(Object.assign({}, initFactoryEvent));
        }
        catch (error) {
            console.log(error);
        }
    }));
    test('makerBonusConfig', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const initFactoryEvent = yield sdk.MakerModule.getInitFactoryEvent();
            console.log(Object.assign({}, initFactoryEvent));
        }
        catch (error) {
            console.log(error);
        }
    }));
});
describe('warp sdk config', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    const config = {
        clmmConfig: {
            pools_id: '',
            global_config_id: '',
            global_vault_id: '',
        },
        tokenConfig: {
            coin_registry_id: '',
            pool_registry_id: '',
            coin_list_owner: '',
            pool_list_owner: '',
        },
        launchpadConfig: {
            pools_id: '',
            admin_cap_id: '',
            config_cap_id: '',
            // lock_manager_id: '',
        },
        xcetusConfig: {
            xcetus_manager_id: '',
            lock_manager_id: '',
            lock_handle_id: "",
            dividend_manager_id: '',
        },
        boosterConfig: {
            booster_config_id: "",
            booster_pool_handle: ''
        },
        makerBonusConfig: {
            maker_config_id: '',
            maker_pool_handle: ''
        }
    };
    test('sdk Config', () => __awaiter(void 0, void 0, void 0, function* () {
        const sdkOptions = sdk.sdkOptions;
        try {
            if (sdkOptions.clmm.clmm_display.length > 0) {
                const initEvent = yield sdk.Resources.getInitEvent();
                config.clmmConfig = initEvent;
            }
        }
        catch (error) {
            console.log(error);
        }
        try {
            if (sdkOptions.token.token_display.length > 0) {
                const tokenConfig = yield sdk.Token.getTokenConfigEvent();
                config.tokenConfig = tokenConfig;
            }
        }
        catch (error) {
            console.log(error);
        }
        try {
            if (sdkOptions.launchpad.ido_display.length > 0) {
                const initFactoryEvent = yield sdk.Launchpad.getInitFactoryEvent();
                // const initLockEvent = await sdk.Launchpad.getInitLockEvent()
                config.launchpadConfig = Object.assign({}, initFactoryEvent);
            }
        }
        catch (error) {
            console.log(error);
        }
        try {
            if (sdkOptions.xcetus.xcetus_display.length > 0) {
                const initFactoryEvent = yield sdk.XCetusModule.getInitFactoryEvent();
                const lockUpManagerEvent = yield sdk.XCetusModule.getLockUpManagerEvent();
                const dividendManagerEvent = yield sdk.XCetusModule.getDividendManagerEvent();
                config.xcetusConfig = Object.assign(Object.assign({}, initFactoryEvent), { lock_manager_id: lockUpManagerEvent.lock_manager_id, lock_handle_id: lockUpManagerEvent.lock_handle_id, dividend_manager_id: dividendManagerEvent.dividend_manager_id });
            }
        }
        catch (error) {
            console.log(error);
        }
        try {
            const initFactoryEvent = yield sdk.BoosterModule.getInitFactoryEvent();
            config.boosterConfig = initFactoryEvent;
        }
        catch (error) {
            console.log(error);
        }
        try {
            const initFactoryEvent = yield sdk.MakerModule.getInitFactoryEvent();
            config.makerBonusConfig = initFactoryEvent;
        }
        catch (error) {
            console.log(error);
        }
        console.log(config);
    }));
});
