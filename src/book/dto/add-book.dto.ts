import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  authorId: number;

  @IsNumber()
  @IsNotEmpty()
  genreId: number;
}
