import { IsNotEmpty, IsString } from 'class-validator';

export class AddAuthorDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
