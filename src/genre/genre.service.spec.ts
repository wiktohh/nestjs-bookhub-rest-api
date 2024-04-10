import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';
import { NotFoundException } from '../exceptions/not-found.exceptions';
describe('GenreService', () => {
  let prismaService: PrismaService;
  let genreService: GenreService;

  const prismaServiceMock = {
    genre: {
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
      providers: [GenreService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    genreService = moduleRef.get<GenreService>(GenreService);
  });

  it('should be defined', () => {
    expect(genreService).toBeDefined();
  });

  describe('getGenres', () => {
    it('should return array of genres', async () => {
      const expectedGenres = [
        { id: 1, name: 'Horror' },
        { id: 2, name: 'Komedia' },
      ];
      (prismaService.genre.findMany as jest.Mock).mockResolvedValue(
        expectedGenres,
      );

      const result = await genreService.getGenres();

      expect(result).toEqual(expectedGenres);
    });
  });

  describe('getGenre', () => {
    it('should return genre when given existing id', async () => {
      const genreId = 1;
      const expectedGenre = { id: genreId, name: 'Horror' };
      (prismaService.genre.findUnique as jest.Mock).mockResolvedValue(
        expectedGenre,
      );

      const result = await genreService.getGenre(genreId);

      expect(result).toEqual(expectedGenre);
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      (prismaService.genre.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(genreService.getGenre(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addGenre', () => {
    it('should add new genre', async () => {
      const newGenreDto = { name: 'Horror' };
      const createdGenre = { id: 1, name: 'Horror' };
      (prismaService.genre.create as jest.Mock).mockResolvedValue(createdGenre);

      const result = await genreService.addGenre(newGenreDto);

      expect(result).toEqual(createdGenre);
    });
  });

  describe('updateGenre', () => {
    it('should update existing genre', async () => {
      const genreId = 1;
      const updatedGenreDto = { name: 'Updated Genre' };
      const existingGenre = { id: genreId, name: 'Original Genre' };
      (prismaService.genre.findUnique as jest.Mock).mockResolvedValue(
        existingGenre,
      );
      const updatedGenre = { ...existingGenre, ...updatedGenreDto };
      (prismaService.genre.update as jest.Mock).mockResolvedValue(updatedGenre);

      const result = await genreService.updateGenre(genreId, updatedGenreDto);

      expect(result).toEqual(updatedGenre);
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      const updatedGenreDto = { name: 'Updated Genre' };
      (prismaService.genre.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        genreService.updateGenre(nonExistingId, updatedGenreDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteGenre', () => {
    it('should delete genre', async () => {
      const genreId = 1;
      const existingGenre = { id: genreId, name: 'Horror' };
      (prismaService.genre.findUnique as jest.Mock).mockResolvedValue(
        existingGenre,
      );

      const result = await genreService.deleteGenre(genreId);

      expect(result).toEqual({});
    });

    it('should throw NotFoundException when given non-existing id', async () => {
      const nonExistingId = 999;
      (prismaService.genre.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(genreService.deleteGenre(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
