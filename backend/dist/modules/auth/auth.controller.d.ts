import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service").TokenResponse>;
    login(dto: LoginDto): Promise<import("./auth.service").TokenResponse>;
    refresh(dto: RefreshDto): Promise<import("./auth.service").TokenResponse>;
    logout(userId: string): Promise<{
        message: string;
    }>;
}
