import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { GetMessagesDto } from './dto/get-messages.dto';
import { SuccessMessage } from '../common/decorators/success-message.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @SuccessMessage('Conversation created successfully')
  async createConversation(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(user.id, dto.friendId);
  }

  @Get('conversations')
  @SuccessMessage('Conversations fetched successfully')
  async getConversations(@CurrentUser() user: JwtUser) {
    return this.messagesService.getConversations(user.id);
  }

  @Post()
  @SuccessMessage('Message created successfully')
  async createMessage(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(user.id, dto);
  }

  @Get('conversations/:conversationId/messages')
  @SuccessMessage('Messages fetched successfully')
  async getMessages(
    @CurrentUser() user: JwtUser,
    @Param('conversationId') conversationId: string,
    @Query() dto: GetMessagesDto,
  ) {
    return this.messagesService.getMessages(
      user.id,
      conversationId,
      dto.limit,
      dto.cursor,
    );
  }
}
