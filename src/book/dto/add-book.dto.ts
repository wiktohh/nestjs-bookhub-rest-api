import { IsNotEmpty, IsString } from 'class-validator';

export class AddBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;
}
