import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from 'src/exceptions/not-found.exceptions';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
