import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '../exceptions/not-found.exceptions';

export interface JWTPayloadInterface {
  id: number;
  role: string;
  iat: number;
  exp: number;
}

export interface PayloadInterface {
  id: number;
  role: string;
}

export interface JWTTokensInterface {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (existingUser) {
        throw new InvalidCredentialsException('User already exists');
      }
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          hashedPassword,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async signIn(dto: SignInDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!user) {
        throw new InvalidCredentialsException();
      }
      const isValidPassword = await bcrypt.compare(
        dto.password,
        user.hashedPassword,
      );
      if (!isValidPassword) {
        throw new InvalidCredentialsException();
      }
      return this.getTokens({ id: user.id, role: user.role });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  private async getTokens(
    payload: PayloadInterface,
  ): Promise<JWTTokensInterface> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<JWTTokensInterface> {
    try {
      const { sub: email } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        throw new NotFoundException();
      }
      return this.getTokens({ id: user.id, role: user.role });
    } catch (error) {
      throw new InvalidCredentialsException();
    }
  }
}
