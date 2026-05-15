"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOrigins = parseOrigins;
function parseOrigins(raw) {
    return raw
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean);
}
//# sourceMappingURL=parse-origins.js.map