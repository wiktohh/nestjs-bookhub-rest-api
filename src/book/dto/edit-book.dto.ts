import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditBookDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsNumber()
  @IsOptional()
  authorId: number;

  @IsNumber()
  @IsOptional()
  genreId: number;
}
