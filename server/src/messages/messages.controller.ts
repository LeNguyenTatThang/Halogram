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

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  async createConversation(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateConversationDto,
  ) {
    return {
      success: true,
      message: 'Conversation created successfully',
      data: await this.messagesService.createConversation(
        user.id,
        dto.friendId,
      ),
    };
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: JwtUser) {
    return {
      success: true,
      message: 'Conversations fetched successfully',
      data: await this.messagesService.getConversations(user.id),
    };
  }

  @Post()
  async createMessage(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateMessageDto,
  ) {
    return {
      success: true,
      message: 'Message created successfully',
      data: await this.messagesService.createMessage(user.id, dto),
    };
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @CurrentUser() user: JwtUser,
    @Param('conversationId') conversationId: string,
    @Query() dto: GetMessagesDto,
  ) {
    return {
      success: true,
      message: 'Messages fetched successfully',
      data: await this.messagesService.getMessages(
        user.id,
        conversationId,
        dto.limit,
        dto.cursor,
      ),
    };
  }
}
