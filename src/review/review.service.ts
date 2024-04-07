import { PrismaService } from 'src/prisma/prisma.service';
import { AddReviewDto, EditReviewDto } from './dto';
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { NotFoundException } from 'src/exceptions/not-found.exceptions';
import { JWTPayloadInterface } from 'src/auth/auth.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getReviews(bookId: number) {
    return await this.prisma.review.findMany({
      where: {
        bookId,
      },
    });
  }
  async getReview(bookId: number, id: number) {
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
    try {
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
      throw new ForbiddenException(
        'There is no such a book in the database for which you want to delete a review',
      );
    }

    if (user.id !== book.authorId) {
      throw new NotFoundException('You are not allowed to delete this review');
    }

    const review = await this.prisma.review.findUnique({
      where: {
        id: bookId,
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
