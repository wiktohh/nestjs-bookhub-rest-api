import { IsOptional, IsString } from 'class-validator';

export class EditGenreDto {
  @IsString()
  @IsOptional()
  name: string;
}
