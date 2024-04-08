import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class EditReviewDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment: string;
}
