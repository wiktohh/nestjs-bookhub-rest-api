import { IsNotEmpty, IsString } from 'class-validator';

export class AddGenreDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
