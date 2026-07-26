import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async register(
    userId: string,
    dto: {
      name: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    const existing = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (existing) {
      throw new ConflictException('You already have a shop');
    }

    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);

    const shop = await this.prisma.shop.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        ownerId: userId,
        verification: {
          create: { status: 'PENDING' },
        },
      },
      include: {
        verification: true,
      },
    });

    return shop;
  }

  async getMyShop(userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
      include: {
        verification: true,
        _count: { select: { products: true } },
      },
    });
    return shop;
  }

  async getBySlug(slug: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { slug },
      include: {
        verification: true,
        _count: { select: { products: true } },
      },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async getById(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        verification: true,
        _count: { select: { products: true } },
      },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(
    userId: string,
    dto: {
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    if (dto.name && dto.name !== shop.name) {
      const slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);

      return this.prisma.shop.update({
        where: { id: shop.id },
        data: { ...dto, slug },
      });
    }

    return this.prisma.shop.update({
      where: { id: shop.id },
      data: dto,
    });
  }

  async uploadLogo(userId: string, file: Express.Multer.File) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const url = await this.cloudinary.uploadImage(file, 'halogram/shops/logos');

    return this.prisma.shop.update({
      where: { id: shop.id },
      data: { logo: url },
    });
  }

  async uploadCover(userId: string, file: Express.Multer.File) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const url = await this.cloudinary.uploadImage(file, 'halogram/shops/covers');

    return this.prisma.shop.update({
      where: { id: shop.id },
      data: { coverImage: url },
    });
  }

  async getVerificationStatus(userId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
      include: { verification: true },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop.verification;
  }

  // Admin only
  async approveVerification(shopId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.prisma.shopVerification.update({
      where: { shopId },
      data: { status: 'APPROVED' },
    });
  }

  async rejectVerification(shopId: string, notes?: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.prisma.shopVerification.update({
      where: { shopId },
      data: { status: 'REJECTED', notes },
    });
  }

  async getPendingVerifications() {
    return this.prisma.shopVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        shop: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getShopByOwnerId(userId: string) {
    return this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });
  }
}
