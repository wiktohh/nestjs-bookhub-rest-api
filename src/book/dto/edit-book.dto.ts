import { IsOptional, IsString } from 'class-validator';

export class EditBookDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  author: string;
}
