import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateLivestreamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
