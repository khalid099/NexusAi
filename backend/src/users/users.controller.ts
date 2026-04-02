import {
  Controller, Get, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get full profile of current user' })
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.users.findById(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateUserDto) {
    return this.users.update(user.userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user account' })
  deleteAccount(@CurrentUser() user: CurrentUserPayload) {
    return this.users.remove(user.userId);
  }

  @Get('me/api-keys')
  @ApiOperation({ summary: 'List API keys for current user' })
  listApiKeys(@CurrentUser() user: CurrentUserPayload) {
    return this.users.listApiKeys(user.userId);
  }

  @Delete('me/api-keys/:keyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API key' })
  revokeApiKey(@CurrentUser() user: CurrentUserPayload, @Param('keyId') keyId: string) {
    return this.users.revokeApiKey(user.userId, keyId);
  }
}
