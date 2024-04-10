import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { AppModule } from '../app.module';

describe('UserService', () => {
  let prismaService: PrismaService;
  let userService: UserService;

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    userService = moduleRef.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user when given existing id', async () => {
      const userId = 1;
      const expectedUser = { id: userId, username: 'testuser' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        expectedUser,
      );

      const result = await userService.getUser(userId);

      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUser(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
