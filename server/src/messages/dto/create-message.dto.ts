import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @ValidateIf((o) => !o.image)
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ValidateIf((o) => !o.content)
  @IsString()
  @IsNotEmpty()
  image?: string;
}
