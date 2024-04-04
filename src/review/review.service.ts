import { PrismaService } from 'src/prisma/prisma.service';
import { AddReviewDto, EditReviewDto } from './dto';

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
    return await this.prisma.review.findUnique({
      where: {
        id,
      },
    });
  }
  async addReview(bookId: number, dto: AddReviewDto) {
    return await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        bookId,
      },
    });
  }
  async updateReview(bookId: number, id: number, dto: EditReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
    });
    if (!review) {
      throw new Error('Review not found');
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
  }
  async deleteReview(bookId: number, id: number) {
    return await this.prisma.review.delete({
      where: {
        id,
      },
    });
  }
}
