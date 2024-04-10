import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditBookDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  authorId: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  genreId: number;
}
