import { IsOptional, IsString } from 'class-validator';

export class EditAuthorDto {
  @IsString()
  @IsOptional()
  name: string;
}
