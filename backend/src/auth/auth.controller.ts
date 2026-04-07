import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService, TokenPair } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from './decorators/current-user.decorator';
import { GoogleProfile } from './strategies/google.strategy';
import { GithubProfile } from './strategies/github.strategy';
import { MicrosoftProfile } from './strategies/microsoft.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private redirectWithTokens(res: Response, tokens: TokenPair): void {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  register(@Body() dto: RegisterDto): Promise<TokenPair> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<TokenPair> {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google consent screen' })
  googleAuth(): void {
    // Passport redirects automatically — no body needed
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback — redirects to frontend with tokens' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend /auth/callback' })
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.validateOAuthUser(req.user);
    this.redirectWithTokens(res, tokens);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub consent screen' })
  githubAuth(): void {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback — redirects to frontend with tokens' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend /auth/callback' })
  async githubCallback(
    @Req() req: Request & { user: GithubProfile },
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.validateGithubUser(req.user);
    this.redirectWithTokens(res, tokens);
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Initiate Microsoft OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Microsoft consent screen' })
  microsoftAuth(): void {}

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  @ApiOperation({ summary: 'Microsoft OAuth callback — redirects to frontend with tokens' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend /auth/callback' })
  async microsoftCallback(
    @Req() req: Request & { user: MicrosoftProfile },
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.validateMicrosoftUser(req.user);
    this.redirectWithTokens(res, tokens);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user payload from JWT' })
  getMe(@CurrentUser() user: CurrentUserPayload): CurrentUserPayload {
    return user;
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new API key for the current user' })
  @ApiResponse({ status: 201, description: 'Returns created API key record' })
  createApiKey(@CurrentUser() user: CurrentUserPayload): Promise<{ id: string; key: string; userId: string; createdAt: Date }> {
    const key = `nai_${Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')}`;

    return this.prisma.apiKey.create({
      data: {
        key,
        userId: user.userId,
        label: 'Default',
      },
      select: {
        id: true,
        key: true,
        userId: true,
        createdAt: true,
      },
    });
  }
}
