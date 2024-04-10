import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddGenreDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
