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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const helmet_1 = __importDefault(require("helmet"));
const path = __importStar(require("path"));
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const parse_origins_1 = require("./common/utils/parse-origins");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    if (!process.env.MINIO_ENDPOINT) {
        const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
        app.useStaticAssets(path.resolve(process.cwd(), uploadDir), {
            prefix: '/uploads',
        });
        logger.log(`Local file storage enabled at /uploads (${uploadDir})`);
    }
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.setGlobalPrefix('api/v1');
    const allowedOrigins = (0, parse_origins_1.parseOrigins)(process.env.CORS_ORIGIN ?? 'http://localhost:3000');
    app.enableCors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
    });
    app.use((0, helmet_1.default)({
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.useGlobalPipes(validation_pipe_1.GlobalValidationPipe);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('艺育皮韵 API')
        .setDescription('Leather Carving Education Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = parseInt(process.env.PORT ?? '5000', 10);
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map