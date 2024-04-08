import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class EditAuthorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
