import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

describe('BookService', () => {
  let prismaService: PrismaService;
  let bookService: BookService;

  const prismaServiceMock = {
    book: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    author: {
      findFirst: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [BookService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    bookService = moduleRef.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(bookService).toBeDefined();
  });

  describe('getBooks', () => {
    it('should return array of books', async () => {
      const expectedBooks = [
        { id: 1, title: 'Book 1', author: 'Jan' },
        { id: 2, title: 'Book 2', author: 'Jan' },
      ];
      (prismaService.book.findMany as jest.Mock).mockResolvedValue(
        expectedBooks,
      );

      const result = await bookService.getBooks();

      expect(result).toEqual(expectedBooks);
    });
  });

  describe('getBook by id', () => {
    it('should return book when given existing id', async () => {
      const bookId = 1;
      const expectedBook = { id: bookId, title: 'Book 1', author: 'Jan' };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(
        expectedBook,
      );

      const result = await bookService.getBook(bookId);

      expect(result).toEqual(expectedBook);
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(bookService.getBook(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addBook', () => {
    it('should add new book', async () => {
      const newBookDto = { title: 'New Book', author: 'John Doe' };
      const author = { id: 1 };
      (prismaService.author.findFirst as jest.Mock).mockResolvedValue(author);
      const createdBook = { id: 1, title: 'New Book', author: 'Jan' };
      (prismaService.book.create as jest.Mock).mockResolvedValue(createdBook);

      const result = await bookService.addBook(newBookDto);

      expect(result).toEqual(createdBook);
    });

    it('should throw NotFoundException when author does not exist', async () => {
      const newBookDto = { title: 'New Book', author: 'Non-existing Author' };
      (prismaService.author.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(bookService.addBook(newBookDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateBook', () => {
    it('should update existing book', async () => {
      const bookId = 1;
      const updatedBookDto = { title: 'Updated Book', author: 'John Doe' };
      const existingBook = {
        id: bookId,
        title: 'Original Book',
        author: 'Jan',
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(
        existingBook,
      );
      const author = { id: 2 };
      (prismaService.author.findFirst as jest.Mock).mockResolvedValue(author);
      const updatedBook = { ...existingBook, ...updatedBookDto, authorId: 2 };
      (prismaService.book.update as jest.Mock).mockResolvedValue(updatedBook);

      const result = await bookService.updateBook(bookId, updatedBookDto);

      expect(result).toEqual(updatedBook);
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      const updatedBookDto = { title: 'Updated Book', author: 'John Doe' };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        bookService.updateBook(nonExistingId, updatedBookDto),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw NotFoundException when author does not exist', async () => {
      const bookId = 1;
      const updatedBookDto = {
        title: 'Updated Book',
        author: 'Non-existing Author',
      };
      const existingBook = {
        id: bookId,
        title: 'Original Book',
        author: 'Jan',
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(
        existingBook,
      );
      (prismaService.author.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        bookService.updateBook(bookId, updatedBookDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBook', () => {
    it('should delete existing book', async () => {
      const bookId = 1;
      const existingBook = {
        id: bookId,
        title: 'Existing Book',
        author: 'Jan',
      };

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(
        existingBook,
      );

      const result = await bookService.deleteBook(bookId);

      expect(result).toEqual({});
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(bookService.deleteBook(nonExistingId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
