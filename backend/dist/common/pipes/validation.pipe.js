"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalValidationPipe = void 0;
const common_1 = require("@nestjs/common");
exports.GlobalValidationPipe = new common_1.ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
});
//# sourceMappingURL=validation.pipe.js.map