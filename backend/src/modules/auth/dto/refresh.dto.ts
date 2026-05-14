import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token issued during login' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
