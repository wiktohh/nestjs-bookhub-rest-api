import { PrismaService } from 'src/prisma/prisma.service';
import { AddAuthorDto } from './dto';
import { Injectable } from '@nestjs/common';
import { EditAuthorDto } from './dto/edit-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthors() {
    return await this.prisma.author.findMany();
  }

  async getAuthor(id: number) {
    return await this.prisma.author.findUnique({
      where: {
        id,
      },
    });
  }

  async addAuthor(dto: AddAuthorDto) {
    return await this.prisma.author.create({
      data: {
        name: dto.name,
      },
    });
  }

  async updateAuthor(id: number, dto: EditAuthorDto) {
    const author = await this.prisma.author.findUnique({
      where: {
        id,
      },
    });
    if (!author) {
      throw new Error('Author not found');
    }
    return await this.prisma.author.update({
      where: {
        id,
      },
      data: {
        name: dto.name || author.name,
      },
    });
  }

  async deleteAuthor(id: number) {
    return await this.prisma.author.delete({
      where: {
        id,
      },
    });
  }
}
