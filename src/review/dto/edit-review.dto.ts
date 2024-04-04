import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditReviewDto {
  @IsNumber()
  @IsOptional()
  rating: number;

  @IsOptional()
  @IsString()
  comment: string;
}
