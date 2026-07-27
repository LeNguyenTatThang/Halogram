import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CartService } from './cart.service';

@Controller('shop/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@CurrentUser() user: JwtUser) {
    return this.cartService.getCart(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  addItem(
    @CurrentUser() user: JwtUser,
    @Body() dto: { productId: string; quantity: number },
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('item/:itemId')
  updateItemQuantity(
    @CurrentUser() user: JwtUser,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItemQuantity(user.id, itemId, body.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('item/:itemId')
  removeItem(@CurrentUser() user: JwtUser, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  clearCart(@CurrentUser() user: JwtUser) {
    return this.cartService.clearCart(user.id);
  }
}
