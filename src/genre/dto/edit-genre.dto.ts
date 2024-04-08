import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditGenreDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
