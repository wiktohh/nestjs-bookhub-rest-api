import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiTags('Users')
  @ApiBearerAuth()
  @Get('me')
  async create(@Req() req) {
    return await this.userService.getUser(req.user.id);
  }
}
