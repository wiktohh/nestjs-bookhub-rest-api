import { Req } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(@Req() req) {
    return await this.prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
  }
}
