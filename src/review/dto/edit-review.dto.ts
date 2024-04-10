import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class EditReviewDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comment: string;
}
