import { PrismaService } from 'src/prisma/prisma.service';
import { AddBookDto } from './dto';
import { EditBookDto } from './dto/edit-book.dto';

export class BookService {
  constructor(private prisma: PrismaService) {}

  async getBooks() {
    return await this.prisma.book.findMany();
  }

  async getBook(id: number) {
    return await this.prisma.book.findUnique({
      where: {
        id,
      },
    });
  }

  async addBook(dto: AddBookDto) {
    const author = await this.prisma.author.findFirst({
      where: {
        name: dto.author,
      },
    });
    if (!author) {
      throw new Error('Author not found');
    }
    return await this.prisma.book.create({
      data: {
        title: dto.title,
        authorId: author.id,
      },
    });
  }

  async updateBook(id: number, dto: EditBookDto) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });
    if (!book) {
      throw new Error('Book not found');
    }

    let authorId;

    if (dto.author) {
      const author = await this.prisma.author.findFirst({
        where: {
          name: dto.author,
        },
      });
      if (!author) {
        throw new Error('Author not found');
      }
      authorId = author.id;
    }

    return await this.prisma.book.update({
      where: {
        id,
      },
      data: {
        title: dto.title || book.title,
        authorId: authorId || book.authorId,
      },
    });
  }

  async deleteBook(id: number) {
    return await this.prisma.book.delete({
      where: {
        id,
      },
    });
  }
}
