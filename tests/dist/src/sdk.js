"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = void 0;
const sui_js_1 = require("@mysten/sui.js");
const boosterModule_1 = require("./modules/boosterModule");
const launchpadModule_1 = require("./modules/launchpadModule");
const makerModule_1 = require("./modules/makerModule");
const poolModule_1 = require("./modules/poolModule");
const positionModule_1 = require("./modules/positionModule");
const resourcesModule_1 = require("./modules/resourcesModule");
const rewarderModule_1 = require("./modules/rewarderModule");
const routerModule_1 = require("./modules/routerModule");
const swapModule_1 = require("./modules/swapModule");
const tokenModule_1 = require("./modules/tokenModule");
const xcetusModule_1 = require("./modules/xcetusModule");
const gas_config_1 = __importDefault(require("./utils/gas_config"));
class SDK {
    constructor(options) {
        this._senderAddress = '';
        this._sdkOptions = options;
        this._fullClient = new sui_js_1.JsonRpcProvider(new sui_js_1.Connection({
            fullnode: options.fullRpcUrl,
            faucet: options.faucetURL,
        }));
        this._swap = new swapModule_1.SwapModule(this);
        this._resources = new resourcesModule_1.ResourcesModule(this);
        this._pool = new poolModule_1.PoolModule(this);
        this._position = new positionModule_1.PositionModule(this);
        this._rewarder = new rewarderModule_1.RewarderModule(this);
        this._router = new routerModule_1.RouterModule(this);
        this._token = new tokenModule_1.TokenModule(this);
        this._launchpad = new launchpadModule_1.LaunchpadModule(this);
        this._xcetusModule = new xcetusModule_1.XCetusModule(this);
        this._boosterModule = new boosterModule_1.BoosterModule(this);
        this._makerModule = new makerModule_1.MakerModule(this);
        this._gasConfig = new gas_config_1.default(1);
    }
    get senderAddress() {
        return this._senderAddress;
    }
    set senderAddress(value) {
        this._senderAddress = value;
    }
    set gasConfig(value) {
        this._gasConfig = value;
    }
    get gasConfig() {
        return this._gasConfig;
    }
    get Swap() {
        return this._swap;
    }
    get fullClient() {
        return this._fullClient;
    }
    get Resources() {
        return this._resources;
    }
    get sdkOptions() {
        return this._sdkOptions;
    }
    get Pool() {
        return this._pool;
    }
    get Position() {
        return this._position;
    }
    get Rewarder() {
        return this._rewarder;
    }
    get Router() {
        return this._router;
    }
    get Token() {
        return this._token;
    }
    get Launchpad() {
        return this._launchpad;
    }
    get XCetusModule() {
        return this._xcetusModule;
    }
    get BoosterModule() {
        return this._boosterModule;
    }
    get MakerModule() {
        return this._makerModule;
    }
}
exports.SDK = SDK;
