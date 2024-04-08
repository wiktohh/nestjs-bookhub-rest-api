import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddBookDto } from './dto';
import { EditBookDto } from './dto/edit-book.dto';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async getBooks() {
    return await this.prisma.book.findMany();
  }

  async getBook(id: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!book) {
      throw new NotFoundException(
        'Could not find a book with the provided id.',
      );
    }

    return book;
  }

  async addBook(dto: AddBookDto) {
    const author = await this.prisma.author.findFirst({
      where: {
        name: dto.author,
      },
    });
    if (!author) {
      throw new NotFoundException(
        'There is no such an author in the database for whom you want to assign a book.',
      );
    }
    try {
      return await this.prisma.book.create({
        data: {
          title: dto.title,
          authorId: author.id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateBook(id: number, dto: EditBookDto) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });
    if (!book) {
      throw new NotFoundException(
        'Could not find a book with the provided id.',
      );
    }

    if (!dto.title && !dto.author) {
      throw new InvalidCredentialsException(
        'You should provide at least one field to update.',
      );
    }

    let authorId;

    if (dto.author) {
      const author = await this.prisma.author.findFirst({
        where: {
          name: dto.author,
        },
      });
      if (!author) {
        throw new NotFoundException(
          'There is no such an author in the database for whom you want to update a book.',
        );
      }
      authorId = author.id;
    }
    try {
      return await this.prisma.book.update({
        where: {
          id,
        },
        data: {
          title: dto.title || book.title,
          authorId: authorId || book.authorId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteBook(id: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!book) {
      throw new NotFoundException('There is no such a book in the database.');
    }

    try {
      return await this.prisma.book.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
