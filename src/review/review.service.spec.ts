import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { InternalServerErrorException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

describe('ReviewService', () => {
  let prismaService: PrismaService;
  let reviewService: ReviewService;

  const prismaServiceMock = {
    review: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    book: {
      findUnique: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ReviewService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    reviewService = moduleRef.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
  });

  describe('getReviews', () => {
    it('should return array of reviews for existing book', async () => {
      const bookId = 1;
      const expectedReviews = [
        { id: 1, rating: 5, comment: 'Great book', bookId },
        { id: 2, rating: 4, comment: 'Good read', bookId },
      ];
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({});
      (prismaService.review.findMany as jest.Mock).mockResolvedValue(
        expectedReviews,
      );

      const result = await reviewService.getReviews(bookId);

      expect(result).toEqual(expectedReviews);
    });

    it('should throw NotFoundException when given non-existing book id', async () => {
      const nonExistingBookId = 999;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.getReviews(nonExistingBookId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReview', () => {
    it('should return review when given existing book id and review id', async () => {
      const bookId = 1;
      const reviewId = 1;
      const expectedReview = {
        id: reviewId,
        rating: 5,
        comment: 'Great book',
        bookId,
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({});
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(
        expectedReview,
      );

      const result = await reviewService.getReview(bookId, reviewId);

      expect(result).toEqual(expectedReview);
    });

    it('should throw NotFoundException when given non-existing book id', async () => {
      const bookId = 999;
      const reviewId = 1;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.getReview(bookId, reviewId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when given non-existing review id', async () => {
      const bookId = 1;
      const reviewId = 999;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({});
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.getReview(bookId, reviewId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addReview', () => {
    it('should add new review for existing book', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const bookId = 1;
      const newReviewDto = { rating: 5, comment: 'Great book' };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({});
      (prismaService.review.create as jest.Mock).mockResolvedValue({});

      const result = await reviewService.addReview(user, bookId, newReviewDto);

      expect(result).toBeTruthy();
    });

    it('should throw NotFoundException when given non-existing book id', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const nonExistingBookId = 999;
      const newReviewDto = { rating: 5, comment: 'Great book' };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        reviewService.addReview(user, nonExistingBookId, newReviewDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('updateReview', () => {
    it('should update existing review for authorized user', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const bookId = 1;
      const reviewId = 1;
      const updatedReviewDto = { rating: 4, comment: 'Updated review' };
      const existingReview = {
        id: reviewId,
        rating: 5,
        comment: 'Great book',
        bookId,
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({
        authorId: user.id,
      });
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(
        existingReview,
      );
      (prismaService.review.update as jest.Mock).mockResolvedValue({
        ...existingReview,
        ...updatedReviewDto,
      });

      const result = await reviewService.updateReview(
        user,
        bookId,
        reviewId,
        updatedReviewDto,
      );

      expect(result).toEqual({ ...existingReview, ...updatedReviewDto });
    });

    it('should throw NotFoundException when given non-existing book id', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const nonExistingBookId = 999;
      const reviewId = 1;
      const updatedReviewDto = { rating: 4, comment: 'Updated review' };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        reviewService.updateReview(
          user,
          nonExistingBookId,
          reviewId,
          updatedReviewDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when given non-existing review id', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const bookId = 1;
      const nonExistingReviewId = 999;
      const updatedReviewDto = { rating: 4, comment: 'Updated review' };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({
        authorId: user.id,
      });
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        reviewService.updateReview(
          user,
          bookId,
          nonExistingReviewId,
          updatedReviewDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is trying to update not his review', async () => {
      const user = { id: 2, role: 'ADMIN', iat: 1, exp: 1 }; // Different user ID than review's author
      const bookId = 1;
      const reviewId = 1;
      const updatedReviewDto = { rating: 4, comment: 'Updated review' };
      const existingReview = {
        id: reviewId,
        rating: 5,
        comment: 'Great book',
        bookId,
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({
        authorId: 1,
      });
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(
        existingReview,
      );

      await expect(
        reviewService.updateReview(user, bookId, reviewId, updatedReviewDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteReview', () => {
    it('should delete review', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const bookId = 1;
      const reviewId = 1;
      const existingReview = {
        id: reviewId,
        rating: 5,
        comment: 'Great book',
        bookId,
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({
        authorId: user.id,
      });
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(
        existingReview,
      );
      (prismaService.review.delete as jest.Mock).mockResolvedValue(
        existingReview,
      );

      const result = await reviewService.deleteReview(user, bookId, reviewId);

      expect(result).toEqual(existingReview);
    });
    it('should throw NotFoundException when given non-existing book id', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const nonExistingBookId = 999;
      const reviewId = 1;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        reviewService.deleteReview(user, nonExistingBookId, reviewId),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFoundException when given non-existing review id', async () => {
      const user = { id: 1, role: 'ADMIN', iat: 1, exp: 1 };
      const bookId = 1;
      const nonExistingReviewId = 999;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({
        authorId: user.id,
      });
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        reviewService.deleteReview(user, bookId, nonExistingReviewId),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw ForbiddenException when user is trying to delete not his review', async () => {
      const user = { id: 2, role: 'ADMIN', iat: 1, exp: 1 };
      const bookId = 1;
      const reviewId = 1;
      const existingReview = {
        id: reviewId,
        rating: 5,
        comment: 'Great book',
        bookId,
      };
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue({
        authorId: 1,
      });
      (prismaService.review.findUnique as jest.Mock).mockResolvedValue(
        existingReview,
      );

      await expect(
        reviewService.deleteReview(user, bookId, reviewId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
