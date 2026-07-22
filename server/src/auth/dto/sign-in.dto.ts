import { IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
