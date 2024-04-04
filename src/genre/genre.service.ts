import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddGenreDto } from './dto';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async getGenres() {
    return await this.prisma.genre.findMany();
  }

  async getGenre(id: number) {
    return await this.prisma.genre.findUnique({
      where: {
        id,
      },
    });
  }

  async addGenre(dto: AddGenreDto) {
    return await this.prisma.genre.create({
      data: {
        name: dto.name,
      },
    });
  }

  async updateGenre(id: number, dto: AddGenreDto) {
    const genre = await this.prisma.genre.findUnique({
      where: {
        id,
      },
    });
    if (!genre) {
      throw new Error('Genre not found');
    }
    return await this.prisma.genre.update({
      where: {
        id,
      },
      data: {
        name: dto.name || genre.name,
      },
    });
  }

  async deleteGenre(id: number) {
    return await this.prisma.genre.delete({
      where: {
        id,
      },
    });
  }
}
