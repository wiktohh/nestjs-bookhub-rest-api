import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async create(@Req() req) {
    return await this.userService.getUser(req.user.id);
  }
}
