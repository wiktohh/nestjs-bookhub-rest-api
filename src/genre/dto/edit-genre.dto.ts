import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditGenreDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
