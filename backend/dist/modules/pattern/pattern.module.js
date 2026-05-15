"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternModule = void 0;
const common_1 = require("@nestjs/common");
const pattern_controller_1 = require("./pattern.controller");
const pattern_service_1 = require("./pattern.service");
let PatternModule = class PatternModule {
};
exports.PatternModule = PatternModule;
exports.PatternModule = PatternModule = __decorate([
    (0, common_1.Module)({
        controllers: [pattern_controller_1.PatternController],
        providers: [pattern_service_1.PatternService],
        exports: [pattern_service_1.PatternService],
    })
], PatternModule);
//# sourceMappingURL=pattern.module.js.map