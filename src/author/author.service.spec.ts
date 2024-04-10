import { Test, TestingModule } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';

describe('AuthorService', () => {
  let prismaService: PrismaService;
  let authorService: AuthorService;

  const prismaServiceMock = {
    author: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthorService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authorService = moduleRef.get<AuthorService>(AuthorService);
  });

  it('should be defined', () => {
    expect(authorService).toBeDefined();
  });
  describe('getAuthors', () => {
    it('should return array of authors', async () => {
      const expectedAuthors = [
        { id: 1, name: 'Author 1' },
        { id: 2, name: 'Author 2' },
      ];
      (prismaService.author.findMany as jest.Mock).mockResolvedValue(
        expectedAuthors,
      );

      const result = await authorService.getAuthors();

      expect(result).toEqual(expectedAuthors);
    });
  });
  describe('getAuthor by id', () => {
    it('should return author by id', async () => {
      const authorId = 1;
      const expectedAuthor = { id: authorId, name: 'Author 1' };
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        expectedAuthor,
      );

      const result = await authorService.getAuthor(authorId);

      expect(result).toEqual(expectedAuthor);
    });
    it('should throw NotFoundException if author not found', async () => {
      const authorId = 1;
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authorService.getAuthor(authorId)).rejects.toThrow(
        new NotFoundException('Could not find an author with the provided id'),
      );
    });
  });
  describe('addAuthor', () => {
    it('should add new author', async () => {
      const newAuthorDto = { name: 'New Author' };
      const createdAuthor = { id: 1, name: 'New Author' };
      (prismaService.author.create as jest.Mock).mockResolvedValue(
        createdAuthor,
      );

      const result = await authorService.addAuthor(newAuthorDto);

      expect(result).toEqual(createdAuthor);
    });
  });
  describe('updateAuthor', () => {
    it('should update existing author', async () => {
      const authorId = 1;
      const updatedAuthorDto = { name: 'Updated Author' };
      const existingAuthor = { id: authorId, name: 'Original Author' };
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        existingAuthor,
      );
      const updatedAuthor = { ...existingAuthor, ...updatedAuthorDto };
      (prismaService.author.update as jest.Mock).mockResolvedValue(
        updatedAuthor,
      );

      const result = await authorService.updateAuthor(
        authorId,
        updatedAuthorDto,
      );

      expect(result).toEqual(updatedAuthor);
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      const updatedAuthorDto = { name: 'Updated Author' };
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authorService.updateAuthor(nonExistingId, updatedAuthorDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('deleteAuthor', () => {
    it('should delete existing author', async () => {
      const authorId = 1;
      const existingAuthor = { id: authorId, name: 'Existing Author' };
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(
        existingAuthor,
      );

      const result = await authorService.deleteAuthor(authorId);

      expect(result).toEqual({});
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      (prismaService.author.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(authorService.deleteAuthor(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
