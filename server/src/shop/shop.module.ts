import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [
    CategoryController,
    ProductController,
    CartController,
    ShopController,
  ],
  providers: [ShopService, CategoryService, ProductService, CartService],
})
export class ShopModule {}
