"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSdkOptions = exports.currSdkEnv = exports.sdkEnv = void 0;
const mainnet_config_1 = require("./mainnet_config");
const testnet_config_1 = require("./testnet_config");
var sdkEnv;
(function (sdkEnv) {
    sdkEnv["mainnet"] = "mainnet";
    sdkEnv["testnet"] = "testnet";
})(sdkEnv = exports.sdkEnv || (exports.sdkEnv = {}));
exports.currSdkEnv = sdkEnv.mainnet;
function buildSdkOptions() {
    switch (exports.currSdkEnv) {
        case sdkEnv.mainnet: return mainnet_config_1.mainnet;
        case sdkEnv.testnet: return testnet_config_1.testnet;
    }
}
exports.buildSdkOptions = buildSdkOptions;
