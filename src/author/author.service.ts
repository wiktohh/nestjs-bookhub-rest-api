import { PrismaService } from '../prisma/prisma.service';
import { AddAuthorDto } from './dto';
import { Injectable, UseGuards } from '@nestjs/common';
import { EditAuthorDto } from './dto/edit-author.dto';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';
@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthors() {
    return await this.prisma.author.findMany();
  }

  async getAuthor(id: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id,
      },
    });

    if (!author) {
      throw new NotFoundException(
        'Could not find an author with the provided id',
      );
    }

    return author;
  }

  async addAuthor(dto: AddAuthorDto) {
    try {
      return await this.prisma.author.create({
        data: {
          name: dto.name,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateAuthor(id: number, dto: EditAuthorDto) {
    try {
      const author = await this.prisma.author.findUnique({
        where: {
          id,
        },
      });
      if (!author) {
        throw new NotFoundException(
          'Could not find an author with the provided id',
        );
      }
      return await this.prisma.author.update({
        where: {
          id,
        },
        data: {
          name: dto.name || author.name,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteAuthor(id: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id,
      },
    });

    if (!author) {
      throw new NotFoundException(
        'There is no such an author in the database.',
      );
    }

    try {
      return await this.prisma.author.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
