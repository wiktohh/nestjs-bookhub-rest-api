import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { AddReviewDto } from './dto/add-review.dto';
import { EditReviewDto } from './dto';

@Controller('/books/:bookId/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  async getReviews(@Param('bookId', ParseIntPipe) bookId: number) {
    return await this.reviewService.getReviews(bookId);
  }
  @Get('/:id')
  async getReview(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.reviewService.getReview(bookId, id);
  }
  @Post()
  async addReview(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: AddReviewDto,
  ) {
    return await this.reviewService.addReview(bookId, body);
  }
  @Patch('/:id')
  async updateReview(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditReviewDto,
  ) {
    return await this.reviewService.updateReview(bookId, id, body);
  }
  @Delete('/:id')
  async deleteReview(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.reviewService.deleteReview(bookId, id);
  }
}
