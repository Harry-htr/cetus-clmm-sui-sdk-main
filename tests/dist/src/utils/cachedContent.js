"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedContent = void 0;
class CachedContent {
    constructor(value, overdueTime = 0) {
        this.overdueTime = overdueTime;
        this.value = value;
    }
    getCacheData() {
        if (this.value === null) {
            return null;
        }
        if (this.overdueTime === 0) {
            return this.value;
        }
        if (Date.parse(new Date().toString()) > this.overdueTime) {
            return null;
        }
        return this.value;
    }
}
exports.CachedContent = CachedContent;
