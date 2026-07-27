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
      salePrice?: number;
      sku?: string;
      categoryId: string;
      stock?: number;
    },
    files: Express.Multer.File[],
    variants?: {
      name: string;
      price: number;
      stock: number;
      sku?: string;
      imageIndex?: number;
    }[],
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

    const hasVariants = variants && variants.length > 0;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          shopId: shop.id,
          categoryId: dto.categoryId,
          name: dto.name,
          slug,
          description: dto.description,
          price: dto.price,
          salePrice: dto.salePrice,
          sku: dto.sku,
          stock: hasVariants
            ? variants.reduce((sum, v) => sum + v.stock, 0)
            : (dto.stock ?? 0),
          images: {
            create: imageUrls.map((url, i) => ({
              url,
              order: i,
            })),
          },
          variants: hasVariants
            ? {
                create: variants.map((v, i) => ({
                  name: v.name,
                  sku: v.sku,
                  price: v.price,
                  stock: v.stock,
                  image:
                    v.imageIndex !== undefined
                      ? imageUrls[v.imageIndex]
                      : undefined,
                  order: i,
                })),
              }
            : undefined,
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          variants: { orderBy: { order: 'asc' } },
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

      return product;
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

    const where: Record<string, unknown> = {
      status: { not: 'ARCHIVED' },
      isActive: true,
    };

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
      if (query.minPrice !== undefined)
        (where.price as Record<string, unknown>).gte = query.minPrice;
      if (query.maxPrice !== undefined)
        (where.price as Record<string, unknown>).lte = query.maxPrice;
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
        where: { shopId, status: { not: 'ARCHIVED' }, isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: true,
        },
      }),
      this.prisma.product.count({
        where: { shopId, status: { not: 'ARCHIVED' }, isActive: true },
      }),
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
        variants: { orderBy: { order: 'asc' } },
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
      sku?: string;
      stock?: number;
      categoryId?: string;
      status?: string;
      isActive?: boolean;
    },
    files?: Express.Multer.File[],
    variants?: {
      name: string;
      price: number;
      stock: number;
      sku?: string;
      imageIndex?: number;
      id?: string;
    }[],
  ) {
    const shop = await this.getVerifiedShop(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.shopId !== shop.id) {
      throw new NotFoundException('Product not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.salePrice !== undefined) data.salePrice = dto.salePrice;
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.name && dto.name !== product.name) {
      data.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);
    }

    if (variants && variants.length > 0) {
      data.stock = variants.reduce((sum, v) => sum + v.stock, 0);
    }

    return this.prisma.$transaction(async (tx) => {
      if (files && files.length > 0) {
        const imageUrls = await this.cloudinary.uploadImages(
          files,
          'halogram/shop/products',
        );

        await tx.productImage.deleteMany({ where: { productId } });

        await tx.productImage.createMany({
          data: imageUrls.map((url, i) => ({
            url,
            productId,
            order: i,
          })),
        });
      }

      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId } });

        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v, i) => ({
              productId,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              image:
                v.imageIndex !== undefined && files && files[v.imageIndex]
                  ? undefined
                  : undefined,
              order: i,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id: productId },
        data: data as any,
        include: {
          images: { orderBy: { order: 'asc' } },
          variants: { orderBy: { order: 'asc' } },
          category: true,
        },
      });
    });
  }

  async remove(userId: string, productId: string) {
    const shop = await this.getVerifiedShop(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { orderItems: { take: 1 } },
    });
    if (!product || product.shopId !== shop.id) {
      throw new NotFoundException('Product not found');
    }

    if (product.orderItems.length > 0) {
      return this.prisma.product.update({
        where: { id: productId },
        data: { status: 'ARCHIVED', isActive: false },
      });
    }

    return this.prisma.product.delete({ where: { id: productId } });
  }

  async getShopProducts(
    userId: string,
    query: {
      search?: string;
      status?: string;
      sort?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { shopId: shop.id };

    if (query.status) {
      if (query.status === 'ACTIVE') {
        where.status = 'ACTIVE';
        where.isActive = true;
      } else if (query.status === 'INACTIVE') {
        where.isActive = false;
      } else if (query.status === 'OUT_OF_STOCK') {
        where.status = 'ACTIVE';
        where.stock = 0;
      } else if (query.status === 'ARCHIVED') {
        where.status = 'ARCHIVED';
      }
    } else {
      where.status = { not: 'ARCHIVED' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
      ];
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
      case 'name':
        orderBy = { name: 'asc' };
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
          variants: { orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.product.count({ where: where as any }),
    ]);

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
