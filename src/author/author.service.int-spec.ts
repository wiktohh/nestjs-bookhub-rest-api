import { Test, TestingModule } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';

describe('AuthorService', () => {
  let prismaService: PrismaService;
  let service: AuthorService;
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    service = moduleRef.get<AuthorService>(AuthorService);
    await prismaService.cleanDb();
  });

  describe('addAuthor', () => {
    it('should add an author', async () => {
      const author = await service.addAuthor({ name: 'John Doe' });
      expect(author).toHaveProperty('id');
      expect(author.name).toBe('John Doe');
    });
    it('should throw an error if author already exists', async () => {
      try {
        await service.addAuthor({ name: 'John Doe' });
        await service.addAuthor({ name: 'John Doe' });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getAuthors', () => {
    it('should return an array of authors', async () => {
      const authors = await service.getAuthors();
      expect(authors).toBeInstanceOf(Array);
    });
  });

  describe('getAuthor by id', () => {
    it('should return an author', async () => {
      const author = await service.addAuthor({ name: 'John Doe' });
      const foundAuthor = await service.getAuthor(author.id);
      expect(foundAuthor).toHaveProperty('id');
      expect(foundAuthor.name).toBe('John Doe');
    });

    it('should throw an error if author is not found', async () => {
      try {
        await service.getAuthor(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('updateAuthor', () => {
    it('should update an author', async () => {
      const author = await service.addAuthor({ name: 'John Doe' });
      const updatedAuthor = await service.updateAuthor(author.id, {
        name: 'Janek Doe',
      });
      expect(updatedAuthor.name).toBe('Janek Doe');
    });

    it('should throw an error if author is not found', async () => {
      try {
        await service.updateAuthor(999, { name: 'Jane Doe' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('deleteAuthor', () => {
    it('should delete an author', async () => {
      const author = await service.addAuthor({ name: 'John Doe' });
      const deletedAuthor = await service.deleteAuthor(author.id);
      expect(deletedAuthor).toHaveProperty('id');
      expect(deletedAuthor.name).toBe('John Doe');
    });

    it('should throw an error if author is not found', async () => {
      try {
        await service.deleteAuthor(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
