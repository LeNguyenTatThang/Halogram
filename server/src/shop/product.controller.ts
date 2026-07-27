import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { ProductService } from './product.service';

@Controller('shop/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAll({
      categoryId,
      search,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      sort,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('shop/:shopId')
  findByShop(
    @Param('shopId') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findByShop(
      shopId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @CurrentUser() user: JwtUser,
    @Body()
    dto: {
      name: string;
      description?: string;
      price: string;
      salePrice?: string;
      sku?: string;
      categoryId: string;
      stock?: string;
      variants?: string;
    },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let variants:
      | {
          name: string;
          price: number;
          stock: number;
          sku?: string;
          imageIndex?: number;
        }[]
      | undefined;
    if (dto.variants) {
      try {
        variants = JSON.parse(dto.variants);
      } catch {}
    }

    return this.productService.create(
      user.id,
      {
        name: dto.name,
        description: dto.description,
        price: parseInt(dto.price),
        salePrice: dto.salePrice ? parseInt(dto.salePrice) : undefined,
        sku: dto.sku,
        categoryId: dto.categoryId,
        stock: dto.stock ? parseInt(dto.stock) : 0,
      },
      files || [],
      variants,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      description?: string;
      price?: string;
      salePrice?: string;
      sku?: string;
      stock?: string;
      categoryId?: string;
      status?: string;
      isActive?: string;
      variants?: string;
    },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const parsed: Record<string, unknown> = {};
    if (dto.name !== undefined) parsed.name = dto.name;
    if (dto.description !== undefined) parsed.description = dto.description;
    if (dto.price !== undefined) parsed.price = parseInt(dto.price);
    if (dto.salePrice !== undefined) parsed.salePrice = parseInt(dto.salePrice);
    if (dto.sku !== undefined) parsed.sku = dto.sku;
    if (dto.stock !== undefined) parsed.stock = parseInt(dto.stock);
    if (dto.categoryId !== undefined) parsed.categoryId = dto.categoryId;
    if (dto.status !== undefined) parsed.status = dto.status;
    if (dto.isActive !== undefined) parsed.isActive = dto.isActive === 'true';

    let variants:
      | {
          name: string;
          price: number;
          stock: number;
          sku?: string;
          imageIndex?: number;
        }[]
      | undefined;
    if (dto.variants) {
      try {
        variants = JSON.parse(dto.variants);
      } catch {}
    }

    return this.productService.update(user.id, id, parsed, files, variants);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  patch(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      description?: string;
      price?: string;
      salePrice?: string;
      sku?: string;
      stock?: string;
      categoryId?: string;
      status?: string;
      isActive?: string;
      variants?: string;
    },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.update(user, id, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.productService.remove(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/list')
  getMyProducts(
    @CurrentUser() user: JwtUser,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.getShopProducts(user.id, {
      search,
      status,
      sort,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }
}
