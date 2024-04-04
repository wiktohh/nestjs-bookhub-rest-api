import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: SignUpDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          hashedPassword,
        },
      });
    } catch (e) {
      // TODO: Handle error
      console.log(e.message);
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
        throw new Error('Invalid credentials');
      }
      const isValidPassword = await bcrypt.compare(
        dto.password,
        user.hashedPassword,
      );
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
      return user;
    } catch (e) {
      throw new Error('Invalid credentials');
    }
  }
}
