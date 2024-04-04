import { PrismaService } from '../prisma/prisma.service';

export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}
