import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
