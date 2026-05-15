"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path = __importStar(require("path"));
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const common_module_1 = require("./common/common.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const redis_module_1 = require("./modules/redis/redis.module");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const course_module_1 = require("./modules/course/course.module");
const review_module_1 = require("./modules/review/review.module");
const storage_module_1 = require("./modules/storage/storage.module");
const artwork_module_1 = require("./modules/artwork/artwork.module");
const favorite_module_1 = require("./modules/favorite/favorite.module");
const comment_module_1 = require("./modules/comment/comment.module");
const pattern_module_1 = require("./modules/pattern/pattern.module");
const category_module_1 = require("./modules/category/category.module");
const product_module_1 = require("./modules/product/product.module");
const cart_module_1 = require("./modules/cart/cart.module");
const address_module_1 = require("./modules/address/address.module");
const order_module_1 = require("./modules/order/order.module");
const banner_module_1 = require("./modules/banner/banner.module");
const community_module_1 = require("./modules/community/community.module");
const notification_module_1 = require("./modules/notification/notification.module");
const ai_module_1 = require("./modules/ai/ai.module");
const gateway_module_1 = require("./modules/gateway/gateway.module");
const admin_module_1 = require("./modules/admin/admin.module");
const system_settings_module_1 = require("./modules/system-settings/system-settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: path.resolve(__dirname, '..', '.env'),
            }),
            common_module_1.CommonModule,
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    { name: 'short', ttl: 1000, limit: 3 },
                    { name: 'medium', ttl: 10000, limit: 20 },
                    { name: 'long', ttl: 60000, limit: 100 },
                ],
            }),
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            course_module_1.CourseModule,
            review_module_1.ReviewModule,
            storage_module_1.StorageModule,
            artwork_module_1.ArtworkModule,
            favorite_module_1.FavoriteModule,
            comment_module_1.CommentModule,
            pattern_module_1.PatternModule,
            category_module_1.CategoryModule,
            product_module_1.ProductModule,
            cart_module_1.CartModule,
            address_module_1.AddressModule,
            order_module_1.OrderModule,
            banner_module_1.BannerModule,
            community_module_1.CommunityModule,
            notification_module_1.NotificationModule,
            ai_module_1.AIModule,
            gateway_module_1.GatewayModule,
            admin_module_1.AdminModule,
            system_settings_module_1.SystemSettingsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map