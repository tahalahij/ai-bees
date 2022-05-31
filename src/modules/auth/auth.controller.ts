import { Controller, Req, Post, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.gaurd';
import { ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User, UserDocument } from './models/user.model';
import { SignupDto, LoginDto } from './dtos/auth.dto';

@ApiTags('users')
@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse()
  @Post('/signup')
  async signup(@Body() body: SignupDto): Promise<User> {
    return this.authService.signup(body);
  }

  @UseGuards(LocalAuthGuard)
  @ApiUnauthorizedResponse()
  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Req() request: Request & { user: UserDocument },
  ): Promise<{ accessToken: string }> {
    return this.authService.login(request.user);
  }
}
