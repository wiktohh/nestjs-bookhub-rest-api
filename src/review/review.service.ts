import { PrismaService } from '../prisma/prisma.service';
import { AddReviewDto, EditReviewDto } from './dto';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { NotFoundException } from '../exceptions/not-found.exceptions';
import { JWTPayloadInterface } from '../auth/auth.service';
import { InternalServerErrorException } from '../exceptions/internal-server-error.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getReviews(bookId: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book) {
      throw new NotFoundException(
        'There is no such a book in the database for which you want to get reviews',
      );
    }
    try {
      return await this.prisma.review.findMany({
        where: {
          bookId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async getReview(bookId: number, id: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book) {
      throw new NotFoundException(
        'There is no such a book in the database for which you want to get a review',
      );
    }
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
    });
    if (!review) {
      throw new NotFoundException(
        'Could not find a review with the provided id.',
      );
    }
    return review;
  }
  async addReview(
    user: JWTPayloadInterface,
    bookId: number,
    dto: AddReviewDto,
  ) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book) {
      throw new NotFoundException(
        'There is no such a book in the database for which you want to add a review',
      );
    }
    try {
      return await this.prisma.review.create({
        data: {
          authorId: user.id,
          rating: dto.rating,
          comment: dto.comment,
          bookId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateReview(
    user: JWTPayloadInterface,
    bookId: number,
    id: number,
    dto: EditReviewDto,
  ) {
    if (!dto.rating && !dto.comment) {
      throw new InvalidCredentialsException(
        'You should provide at least one field to update.',
      );
    }
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new NotFoundException(
        'There is no such a book in the database for which you want to update a review',
      );
    }
    if (user.id !== book.authorId) {
      throw new ForbiddenException('You are not allowed to update this review');
    }
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
    });
    if (!review) {
      throw new NotFoundException(
        'Could not find a review with the provided id.',
      );
    }
    try {
      return await this.prisma.review.update({
        where: {
          id,
        },
        data: {
          rating: dto.rating || review.rating,
          comment: dto.comment || review.comment,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async deleteReview(user: JWTPayloadInterface, bookId: number, id: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new NotFoundException(
        'There is no such a book in the database for which you want to delete a review',
      );
    }

    if (user.id !== book.authorId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException(
        'Could not find a review with the provided id.',
      );
    }

    try {
      return await this.prisma.review.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
