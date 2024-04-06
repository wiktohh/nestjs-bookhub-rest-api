import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddGenreDto } from './dto';
import { NotFoundException } from 'src/exceptions/not-found.exceptions';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async getGenres() {
    return await this.prisma.genre.findMany();
  }

  async getGenre(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: {
        id,
      },
    });
    if (!genre) {
      throw new NotFoundException('There is no genre with the provided id.');
    }
    return genre;
  }

  async addGenre(dto: AddGenreDto) {
    try {
      return await this.prisma.genre.create({
        data: {
          name: dto.name,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateGenre(id: number, dto: AddGenreDto) {
    try {
      const genre = await this.prisma.genre.findUnique({
        where: {
          id,
        },
      });
      if (!genre) {
        throw new NotFoundException('There is no genre with the provided id.');
      }
      return await this.prisma.genre.update({
        where: {
          id,
        },
        data: {
          name: dto.name || genre.name,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteGenre(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new NotFoundException(
        'There is no genre with the provided id in the database.',
      );
    }

    try {
      return await this.prisma.genre.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
