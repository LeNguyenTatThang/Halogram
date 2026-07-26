import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async getVerifiedShop(userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
      include: { verification: true },
    });

    if (!shop) throw new NotFoundException('You do not have a shop');
    if (shop.verification?.status !== 'APPROVED') {
      throw new ForbiddenException('Your shop is not verified yet');
    }

    return shop;
  }

  async create(
    userId: string,
    dto: {
      name: string;
      description?: string;
      price: number;
      categoryId: string;
      stock?: number;
    },
    files: Express.Multer.File[],
  ) {
    const shop = await this.getVerifiedShop(userId);

    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);

    const imageUrls =
      files.length > 0
        ? await this.cloudinary.uploadImages(files, 'halogram/shop/products')
        : [];

    return this.prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        stock: dto.stock ?? 0,
        images: {
          create: imageUrls.map((url, i) => ({
            url,
            order: i,
          })),
        },
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            verification: { select: { status: true } },
          },
        },
      },
    });
  }

  async findAll(query: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) (where.price as Record<string, unknown>).gte = query.minPrice;
      if (query.maxPrice !== undefined) (where.price as Record<string, unknown>).lte = query.maxPrice;
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (query.sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'sold':
        orderBy = { soldCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: where as any,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: true,
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              verification: { select: { status: true } },
            },
          },
        },
      }),
      this.prisma.product.count({ where: where as any }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByShop(shopId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { shopId, isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: true,
        },
      }),
      this.prisma.product.count({ where: { shopId, isActive: true } }),
    ]);

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            coverImage: true,
            verification: { select: { status: true } },
            _count: { select: { products: true } },
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    userId: string,
    productId: string,
    dto: {
      name?: string;
      description?: string;
      price?: number;
      salePrice?: number;
      stock?: number;
      categoryId?: string;
      isActive?: boolean;
    },
    files?: Express.Multer.File[],
  ) {
    const shop = await this.getVerifiedShop(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.shopId !== shop.id) {
      throw new NotFoundException('Product not found');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.name && dto.name !== product.name) {
      data.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);
    }

    if (files && files.length > 0) {
      const imageUrls = await this.cloudinary.uploadImages(
        files,
        'halogram/shop/products',
      );

      return this.prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId } });

        await tx.productImage.createMany({
          data: imageUrls.map((url, i) => ({
            url,
            productId,
            order: i,
          })),
        });

        return tx.product.update({
          where: { id: productId },
          data: data as any,
          include: {
            images: { orderBy: { order: 'asc' } },
          },
        });
      });
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: data as any,
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async remove(userId: string, productId: string) {
    const shop = await this.getVerifiedShop(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.shopId !== shop.id) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({ where: { id: productId } });
  }

  async getShopProducts(userId: string, page = 1, limit = 20) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.findByShop(shop.id, page, limit);
  }
}
