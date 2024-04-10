import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from './dto';
import * as bcrypt from 'bcrypt';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { NotFoundException } from '../exceptions/not-found.exceptions';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    jest.spyOn(bcrypt, 'hash').mockImplementation();
    jest.spyOn(bcrypt, 'compare').mockImplementation();
    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'USER',
      };
      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await authService.signUp(signUpDto);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          firstName: signUpDto.firstName,
          lastName: signUpDto.lastName,
          email: signUpDto.email,
          role: signUpDto.role,
          hashedPassword,
        },
      });
    });
  });

  describe('signIn', () => {
    it('should sign in user and return tokens', async () => {
      const signInDto: SignInDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const user = {
        id: 1,
        email: signInDto.email,
        hashedPassword: await bcrypt.hash(signInDto.password, 10),
        role: 'USER',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('accessToken');

      const tokens = await authService.signIn(signInDto);

      expect(tokens.accessToken).toEqual('accessToken');
    });

    it('should throw InvalidCredentialsException when user does not exist', async () => {
      const signInDto: SignInDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrowError(
        InvalidCredentialsException,
      );
    });

    it('should throw InvalidCredentialsException when password is incorrect', async () => {
      const signInDto: SignInDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const user = {
        id: 1,
        email: signInDto.email,
        hashedPassword: await bcrypt.hash('incorrectPassword', 10),
        role: 'USER',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(signInDto)).rejects.toThrowError(
        InvalidCredentialsException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const token = 'refreshToken';
      const user = { id: 1, email: 'john.doe@example.com', role: 'USER' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: user.email,
      });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('newAccessToken');

      const tokens = await authService.refreshToken(token);

      expect(tokens.accessToken).toEqual('newAccessToken');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const token = 'refreshToken';
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: 'john.doe@example.com',
      });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshToken(token)).rejects.toThrowError(
        InvalidCredentialsException,
      );
    });

    it('should throw InvalidCredentialsException when token is invalid', async () => {
      const token = 'invalidToken';
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(authService.refreshToken(token)).rejects.toThrowError(
        InvalidCredentialsException,
      );
    });
  });
});
