import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddReviewDto {
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
