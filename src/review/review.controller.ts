import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { AddReviewDto } from './dto/add-review.dto';
import { EditReviewDto } from './dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Request } from 'express';
import { JWTPayloadInterface } from 'src/auth/auth.service';

@UseGuards(JwtGuard)
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
    @Req() req: Request & { user: JWTPayloadInterface },
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: AddReviewDto,
  ) {
    return await this.reviewService.addReview(req.user, bookId, body);
  }
  async updateReview(
    @Req() req: Request & { user: JWTPayloadInterface },
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditReviewDto,
  ) {
    const userId = req.user;
    return await this.reviewService.updateReview(req.user, bookId, id, body);
  }
  @Delete('/:id')
  async deleteReview(
    @Req() req: Request & { user: JWTPayloadInterface },
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log(req.user);
    return await this.reviewService.deleteReview(req.user, bookId, id);
  }
}
