import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { ReviewModule } from './modules/review/review.module';
import { StorageModule } from './modules/storage/storage.module';
import { ArtworkModule } from './modules/artwork/artwork.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { CommentModule } from './modules/comment/comment.module';
import { PatternModule } from './modules/pattern/pattern.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { AddressModule } from './modules/address/address.module';
import { OrderModule } from './modules/order/order.module';
import { BannerModule } from './modules/banner/banner.module';
import { CommunityModule } from './modules/community/community.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AIModule } from './modules/ai/ai.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Global modules
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
    RedisModule,

    // Rate limiting — tiered throttlers for burst protection and general traffic
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 3 }, // 3/sec for burst protection
        { name: 'medium', ttl: 10000, limit: 20 }, // 20/10sec for normal traffic
        { name: 'long', ttl: 60000, limit: 100 }, // 100/min general cap
      ],
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    UserModule,
    CourseModule,
    ReviewModule,
    StorageModule,
    ArtworkModule,
    FavoriteModule,
    CommentModule,
    PatternModule,
    CategoryModule,
    ProductModule,
    CartModule,
    AddressModule,
    OrderModule,
    BannerModule,
    CommunityModule,
    NotificationModule,
    AIModule,
    GatewayModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
