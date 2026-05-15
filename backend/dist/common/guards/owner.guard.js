"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let OwnerGuard = class OwnerGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        if (user.role === client_1.UserRole.ADMIN) {
            return true;
        }
        const resourceUserId = request.params['userId'] ?? request.params['id'];
        if (resourceUserId && resourceUserId !== user.sub) {
            throw new common_1.ForbiddenException('You can only access your own resources');
        }
        return true;
    }
};
exports.OwnerGuard = OwnerGuard;
exports.OwnerGuard = OwnerGuard = __decorate([
    (0, common_1.Injectable)()
], OwnerGuard);
//# sourceMappingURL=owner.guard.js.map