import { PrismaClient, FriendshipStatus, VoucherDiscountType, PromotionType, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const MAIN_EMAIL = 'dez@gmail.com';

async function main() {
  console.log('🌱 Seeding...');

  // ============================
  // EXISTING HALOGRAM SEED
  // ============================

  await prisma.voucherUsage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shopVerification.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.storyView.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.story.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany({ where: { email: { not: MAIN_EMAIL } } });

  const password = await bcrypt.hash('123456', 10);

  const mainUser = await prisma.user.upsert({
    where: { email: MAIN_EMAIL },
    update: {},
    create: {
      username: 'dez',
      email: MAIN_EMAIL,
      password,
      displayName: 'Dez',
      firstName: 'Dez',
      lastName: 'Developer',
      avatar: faker.image.avatar(),
      bio: 'Main account',
      isVerified: true,
    },
  });

  const users = [mainUser];

  for (let i = 0; i < 30; i++) {
    users.push(
      await prisma.user.create({
        data: {
          username: `${faker.internet.username().toLowerCase()}${i}`,
          email: faker.internet.email().toLowerCase(),
          password,
          displayName: faker.person.fullName(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          isVerified: faker.datatype.boolean(),
        },
      }),
    );
  }

  const posts: any[] = [];

  for (const u of users) {
    if (u.id !== mainUser.id) {
      await prisma.follow.create({
        data: { followerId: mainUser.id, followingId: u.id },
      });
      if (Math.random() > 0.3) {
        await prisma.follow.create({
          data: { followerId: u.id, followingId: mainUser.id },
        });
      }
    }

    const pc = u.id === mainUser.id ? 8 : 3;
    for (let i = 0; i < pc; i++) {
      const post = await prisma.post.create({
        data: { userId: u.id, caption: faker.lorem.sentence() },
      });
      posts.push(post);
      const imgs = faker.number.int({ min: 1, max: 4 });
      for (let j = 0; j < imgs; j++) {
        await prisma.postImage.create({
          data: { postId: post.id, url: faker.image.urlPicsumPhotos() },
        });
      }
    }

    const sc = u.id === mainUser.id ? 5 : 1;
    for (let i = 0; i < sc; i++) {
      await prisma.story.create({
        data: { userId: u.id, image: faker.image.urlPicsumPhotos() },
      });
    }
  }

  for (const post of posts) {
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: mainUser.id,
        text: faker.lorem.sentence(),
      },
    });
    try {
      await prisma.postLike.create({
        data: { postId: post.id, userId: mainUser.id },
      });
      // eslint-disable-next-line no-empty
    } catch {}
    const shuffled = faker.helpers.shuffle(users);
    const extra = post.userId === mainUser.id ? 10 : 3;
    for (let i = 0; i < extra; i++) {
      const u = shuffled[i];
      if (!u || u.id === mainUser.id) continue;
      try {
        await prisma.postLike.create({
          data: { postId: post.id, userId: u.id },
        });
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }

  for (const u of users) {
    if (u.id === mainUser.id) continue;
    await prisma.friendship.create({
      data: {
        userId: mainUser.id,
        friendId: u.id,
        status: FriendshipStatus.ACCEPTED,
      },
    });
  }

  for (const u of users.slice(1, 8)) {
    const c = await prisma.conversation.create({ data: {} });
    await prisma.conversationMember.createMany({
      data: [
        { conversationId: c.id, userId: mainUser.id },
        { conversationId: c.id, userId: u.id },
      ],
    });
    for (let i = 0; i < 20; i++) {
      await prisma.message.create({
        data: {
          conversationId: c.id,
          senderId: Math.random() > 0.5 ? mainUser.id : u.id,
          content: faker.lorem.sentence(),
        },
      });
    }
  }

  console.log('✅ Existing Halogram data seeded');

  // ============================
  // HALO SHOP SEED
  // ============================

  await seedHaloShop(users, mainUser);
  console.log('✅ Halo Shop data seeded');
  console.log('✅ Done');
}

async function seedHaloShop(users: Array<{ id: string; email: string; username: string; displayName: string; avatar: string | null }>, mainUser: { id: string; email: string }) {
  // ---------- CATEGORIES ----------
  const categoryData = [
    { name: 'Thời trang', slug: 'thoi-trang' },
    { name: 'Điện thoại', slug: 'dien-thoai' },
    { name: 'Laptop', slug: 'laptop' },
    { name: 'Điện tử', slug: 'dien-tu' },
    { name: 'Phụ kiện', slug: 'phu-kien' },
    { name: 'Gia dụng', slug: 'gia-dung' },
    { name: 'Làm đẹp', slug: 'lam-dep' },
    { name: 'Đồ ăn', slug: 'do-an' },
    { name: 'Đồ uống', slug: 'do-uong' },
    { name: 'Thể thao', slug: 'the-thao' },
    { name: 'Sách', slug: 'sach' },
    { name: 'Khác', slug: 'khac' },
  ];

  const categories: Array<{ id: string; name: string; slug: string }> = [];
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug, image: faker.image.urlPicsumPhotos() },
    });
    categories.push(c);
  }
  console.log(`  ✅ ${categories.length} categories`);

  const catMap = (slug: string) => categories.find(c => c.slug === slug)!.id;

  // ---------- USERS FOR SHOPS ----------
  // users[0] = mainUser (dez)
  // users[1] = Halo Fashion (APPROVED)
  // users[2] = Halo Tech (APPROVED)
  // users[3] = Halo Beauty (APPROVED)
  // users[4] = Halo Home (APPROVED)
  // users[5] = Halo Food (APPROVED)
  // users[6] = PENDING shop
  // users[7] = REJECTED shop
  // users[8] = no shop (regular user)

  // ---------- CREATE SHOPS ----------
  const shopDefs = [
    {
      userIdx: 1,
      name: 'Halo Fashion',
      slug: 'halo-fashion',
      description: 'Shop thời trang cao cấp, đa dạng phong cách từ basic đến trendy.',
      phone: '0901000001',
      email: 'fashion@haloshop.com',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      status: 'APPROVED' as const,
    },
    {
      userIdx: 2,
      name: 'Halo Tech',
      slug: 'halo-tech',
      description: 'Công nghệ chính hãng, giá tốt nhất thị trường.',
      phone: '0901000002',
      email: 'tech@haloshop.com',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      status: 'APPROVED' as const,
    },
    {
      userIdx: 3,
      name: 'Halo Beauty',
      slug: 'halo-beauty',
      description: 'Mỹ phẩm chính hãng, làm đẹp từ thiên nhiên.',
      phone: '0901000003',
      email: 'beauty@haloshop.com',
      address: '789 Võ Văn Tần, Quận 3, TP.HCM',
      status: 'APPROVED' as const,
    },
    {
      userIdx: 4,
      name: 'Halo Home',
      slug: 'halo-home',
      description: 'Đồ gia dụng, nội thất thông minh cho ngôi nhà của bạn.',
      phone: '0901000004',
      email: 'home@haloshop.com',
      address: '321 Pasteur, Quận 3, TP.HCM',
      status: 'APPROVED' as const,
    },
    {
      userIdx: 5,
      name: 'Halo Food',
      slug: 'halo-food',
      description: 'Đặc sản vùng miền, thực phẩm sạch, đồ uống nhập khẩu.',
      phone: '0901000005',
      email: 'food@haloshop.com',
      address: '654 Hai Bà Trưng, Quận 1, TP.HCM',
      status: 'APPROVED' as const,
    },
    {
      userIdx: 6,
      name: 'Halo Sport Pending',
      slug: 'halo-sport-pending',
      description: 'Đang chờ duyệt.',
      status: 'PENDING' as const,
    },
    {
      userIdx: 7,
      name: 'Halo Books Rejected',
      slug: 'halo-books-rejected',
      description: 'Shop sách.',
      status: 'REJECTED' as const,
    },
  ];

  const shops: Array<{ id: string; name: string; slug: string; ownerId: string }> = [];
  for (const def of shopDefs) {
    const owner = users[def.userIdx];
    const existingShop = await prisma.shop.findUnique({ where: { ownerId: owner.id } });
    let shop;
    if (existingShop) {
      shop = await prisma.shop.update({
        where: { id: existingShop.id },
        data: {
          name: def.name,
          slug: def.slug,
          description: def.description,
          phone: def.phone,
          email: def.email,
          address: def.address,
          logo: faker.image.avatar(),
          coverImage: faker.image.urlPicsumPhotos(),
        },
      });
      await prisma.shopVerification.upsert({
        where: { shopId: shop.id },
        update: { status: def.status },
        create: { shopId: shop.id, status: def.status },
      });
    } else {
      shop = await prisma.shop.create({
        data: {
          name: def.name,
          slug: def.slug,
          description: def.description,
          phone: def.phone,
          email: def.email,
          address: def.address,
          ownerId: owner.id,
          logo: faker.image.avatar(),
          coverImage: faker.image.urlPicsumPhotos(),
          verification: { create: { status: def.status } },
        },
      });
    }
    shops.push(shop);
  }

  // Also give mainUser (dez) an APPROVED shop
  const mainShop = await prisma.shop.upsert({
    where: { ownerId: mainUser.id },
    update: { name: 'Dez Shop', slug: 'dez-shop' },
    create: {
      name: 'Dez Shop',
      slug: 'dez-shop',
      description: 'Shop của Dez - đa dạng sản phẩm công nghệ và phụ kiện.',
      phone: '0901999999',
      email: 'dez@haloshop.com',
      address: '999 Trần Hưng Đạo, Quận 1, TP.HCM',
      ownerId: mainUser.id,
      logo: faker.image.avatar(),
      coverImage: faker.image.urlPicsumPhotos(),
      verification: { create: { status: 'APPROVED' } },
    },
  });
  shops.push(mainShop);

  console.log(`  ✅ ${shops.length} shops (${shopDefs.filter(s => s.status === 'APPROVED').length + 1} APPROVED, ${shopDefs.filter(s => s.status !== 'APPROVED').length} other)`);

  // ---------- PRODUCTS ----------
  const productDefs = [
    // Halo Fashion (shops[0]) - category: thoi-trang
    { shopIdx: 0, category: 'thoi-trang', name: 'Áo thun Basic Cotton', price: 199000, salePrice: 149000, stock: 200, sold: 1500, rating: 4.5 },
    { shopIdx: 0, category: 'thoi-trang', name: 'Áo sơ mi Oxford trắng', price: 399000, stock: 80, sold: 600, rating: 4.3 },
    { shopIdx: 0, category: 'thoi-trang', name: 'Quần jean ống thẳng Classic', price: 499000, salePrice: 399000, stock: 120, sold: 890, rating: 4.4 },
    { shopIdx: 0, category: 'thoi-trang', name: 'Áo hoodie Oversize', price: 459000, stock: 60, sold: 340, rating: 4.2 },
    { shopIdx: 0, category: 'thoi-trang', name: 'Quần short kaki nam', price: 249000, stock: 150, sold: 720, rating: 4.1 },
    { shopIdx: 0, category: 'thoi-trang', name: 'Váy midi hoa nhí', price: 359000, salePrice: 289000, stock: 0, sold: 1200, rating: 4.6 },
    { shopIdx: 0, category: 'thoi-trang', name: 'Áo khoác jeans', price: 599000, stock: 3, sold: 95, rating: 4.0 },

    // Halo Tech (shops[1]) - category: dien-tu, phu-kien
    { shopIdx: 1, category: 'phu-kien', name: 'Tai nghe Bluetooth Pro', price: 799000, salePrice: 599000, stock: 100, sold: 2500, rating: 4.7 },
    { shopIdx: 1, category: 'phu-kien', name: 'Chuột không dây Silent', price: 299000, stock: 200, sold: 1800, rating: 4.4 },
    { shopIdx: 1, category: 'phu-kien', name: 'Bàn phím cơ RGB', price: 899000, stock: 50, sold: 950, rating: 4.8 },
    { shopIdx: 1, category: 'dien-tu', name: 'Webcam Full HD 1080p', price: 459000, stock: 75, sold: 430, rating: 4.2 },
    { shopIdx: 1, category: 'phu-kien', name: 'Hub USB-C 7 trong 1', price: 349000, salePrice: 299000, stock: 0, sold: 670, rating: 4.3 },
    { shopIdx: 1, category: 'dien-thoai', name: 'Ốp lưng điện thoại silicon', price: 99000, stock: 500, sold: 3200, rating: 4.1 },
    { shopIdx: 1, category: 'phu-kien', name: 'Sạc dự phòng 20000mAh', price: 549000, stock: 40, sold: 780, rating: 4.5 },
    { shopIdx: 1, category: 'dien-tu', name: 'Loa bluetooth mini', price: 399000, salePrice: 299000, stock: 2, sold: 1100, rating: 4.3 },

    // Halo Beauty (shops[2]) - category: lam-dep
    { shopIdx: 2, category: 'lam-dep', name: 'Kem dưỡng ẩm Vitamin B5', price: 259000, stock: 150, sold: 2100, rating: 4.6 },
    { shopIdx: 2, category: 'lam-dep', name: 'Sữa rửa mặt dịu nhẹ', price: 129000, stock: 300, sold: 4500, rating: 4.5 },
    { shopIdx: 2, category: 'lam-dep', name: 'Son dưỡng môi tự nhiên', price: 59000, stock: 500, sold: 6200, rating: 4.0 },
    { shopIdx: 2, category: 'lam-dep', name: 'Mặt nạ giấy collagen', price: 39000, stock: 0, sold: 8900, rating: 4.2 },
    { shopIdx: 2, category: 'lam-dep', name: 'Nước tẩy trang Micellar', price: 189000, salePrice: 149000, stock: 80, sold: 1800, rating: 4.4 },
    { shopIdx: 2, category: 'lam-dep', name: 'Serum Vitamin C sáng da', price: 399000, stock: 45, sold: 920, rating: 4.7 },
    { shopIdx: 2, category: 'lam-dep', name: 'Kem chống nắng SPF50+', price: 219000, stock: 120, sold: 3200, rating: 4.3 },

    // Halo Home (shops[3]) - category: gia-dung
    { shopIdx: 3, category: 'gia-dung', name: 'Đèn bàn LED thông minh', price: 359000, stock: 90, sold: 540, rating: 4.4 },
    { shopIdx: 3, category: 'gia-dung', name: 'Bình giữ nhiệt 500ml', price: 199000, salePrice: 149000, stock: 200, sold: 2800, rating: 4.5 },
    { shopIdx: 3, category: 'gia-dung', name: 'Kệ để bàn đa năng', price: 299000, stock: 60, sold: 340, rating: 4.1 },
    { shopIdx: 3, category: 'gia-dung', name: 'Gối ngủ memory foam', price: 459000, stock: 4, sold: 210, rating: 4.3 },
    { shopIdx: 3, category: 'gia-dung', name: 'Máy lọc không khí mini', price: 1299000, salePrice: 999000, stock: 25, sold: 180, rating: 4.6 },

    // Halo Food (shops[4]) - category: do-an, do-uong
    { shopIdx: 4, category: 'do-uong', name: 'Cà phê rang xay 500g', price: 159000, stock: 100, sold: 1500, rating: 4.8 },
    { shopIdx: 4, category: 'do-uong', name: 'Trà đào hộp 20 gói', price: 89000, stock: 200, sold: 2100, rating: 4.2 },
    { shopIdx: 4, category: 'do-an', name: 'Bánh quy bơ nhập khẩu', price: 129000, salePrice: 99000, stock: 0, sold: 3400, rating: 4.4 },
    { shopIdx: 4, category: 'do-an', name: 'Snack khoai tây vị BBQ', price: 29000, stock: 500, sold: 8900, rating: 4.0 },
    { shopIdx: 4, category: 'do-uong', name: 'Mật ong hoa rừng 250ml', price: 199000, stock: 70, sold: 450, rating: 4.6 },

    // Dez Shop (shops[5]) - mixed categories
    { shopIdx: 5, category: 'phu-kien', name: 'Dây sạc Type-C cao cấp', price: 99000, stock: 300, sold: 1500, rating: 4.2 },
    { shopIdx: 5, category: 'phu-kien', name: 'Giá đỡ điện thoại gập', price: 149000, stock: 150, sold: 830, rating: 4.0 },
    { shopIdx: 5, category: 'the-thao', name: 'Bình nước thể thao 750ml', price: 179000, stock: 100, sold: 600, rating: 4.3 },
    { shopIdx: 5, category: 'sach', name: 'Sách Nhà giả kim', price: 89000, stock: 50, sold: 1200, rating: 4.9 },
    { shopIdx: 5, category: 'sach', name: 'Sách Đắc nhân tâm', price: 79000, salePrice: 59000, stock: 3, sold: 2100, rating: 4.7 },
    { shopIdx: 5, category: 'gia-dung', name: 'Móc treo tường đa năng', price: 49000, stock: 400, sold: 3400, rating: 4.1 },
  ];

  interface CreatedProduct {
    id: string;
    shopId: string;
    name: string;
    price: number;
    salePrice: number | null;
    stock: number;
    soldCount: number;
    rating: number;
    slug: string;
  }

  const products: CreatedProduct[] = [];
  for (const def of productDefs) {
    const shop = shops[def.shopIdx];
    const catId = catMap(def.category);
    const slug = def.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);

    const existing = await prisma.product.findUnique({
      where: { shopId_slug: { shopId: shop.id, slug } },
    });

    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          categoryId: catId,
          name: def.name,
          price: def.price,
          salePrice: def.salePrice ?? null,
          stock: def.stock,
          soldCount: def.sold,
          rating: def.rating,
          description: faker.lorem.paragraph(),
          isActive: def.stock === 0 ? true : true,
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          shopId: shop.id,
          categoryId: catId,
          name: def.name,
          slug,
          price: def.price,
          salePrice: def.salePrice ?? null,
          stock: def.stock,
          soldCount: def.sold,
          rating: def.rating,
          reviewCount: Math.floor(def.sold / 10),
          description: faker.lorem.paragraph(),
        },
      });
    }

    // Add 3-5 product images
    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      const imgCount = faker.number.int({ min: 3, max: 5 });
      for (let i = 0; i < imgCount; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: faker.image.urlPicsumPhotos(),
            order: i,
          },
        });
      }
    }

    products.push({ ...product, salePrice: product.salePrice, soldCount: def.sold, price: def.price, rating: def.rating, stock: def.stock, slug });
  }
  console.log(`  ✅ ${products.length} products with images`);

  // ---------- VOUCHERS ----------
  const voucherDefs = [
    { shopIdx: 0, code: 'FASHION10', type: VoucherDiscountType.PERCENTAGE, value: 10, minOrder: 100000, maxDiscount: 50000, qty: 100, used: 45, startDaysAgo: 10, endDaysLater: 20 },
    { shopIdx: 0, code: 'FASHION50K', type: VoucherDiscountType.FIXED, value: 50000, minOrder: 300000, qty: 50, used: 50, startDaysAgo: 30, endDaysLater: -10 },
    { shopIdx: 1, code: 'TECH20', type: VoucherDiscountType.PERCENTAGE, value: 20, minOrder: 200000, maxDiscount: 100000, qty: 200, used: 30, startDaysAgo: 5, endDaysLater: 25 },
    { shopIdx: 1, code: 'TECHFREE', type: VoucherDiscountType.FIXED, value: 0, minOrder: 0, qty: 0, used: 0, startDaysAgo: 5, endDaysLater: 25 }, // Đã hết số lượng
    { shopIdx: 2, code: 'BEAUTY15', type: VoucherDiscountType.PERCENTAGE, value: 15, minOrder: 150000, maxDiscount: 40000, qty: 100, used: 10, startDaysAgo: 3, endDaysLater: 30 },
    { shopIdx: 2, code: 'BEAUTY20K', type: VoucherDiscountType.FIXED, value: 20000, minOrder: 0, qty: 300, used: 120, startDaysAgo: 7, endDaysLater: 14 },
    { shopIdx: 3, code: 'HOME25', type: VoucherDiscountType.PERCENTAGE, value: 25, minOrder: 500000, maxDiscount: 150000, qty: 50, used: 5, startDaysAgo: 1, endDaysLater: 60 },
    { shopIdx: 4, code: 'FOOD5', type: VoucherDiscountType.PERCENTAGE, value: 5, minOrder: 0, maxDiscount: 10000, qty: 500, used: 200, startDaysAgo: 15, endDaysLater: 15 },
    { shopIdx: 5, code: 'DEZ10', type: VoucherDiscountType.PERCENTAGE, value: 10, minOrder: 50000, maxDiscount: 30000, qty: 200, used: 60, startDaysAgo: 20, endDaysLater: 40 },
    { shopIdx: 5, code: 'DEZ50K', type: VoucherDiscountType.FIXED, value: 50000, minOrder: 500000, qty: 100, used: 0, startDaysAgo: -5, endDaysLater: 30 }, // Sắp bắt đầu
  ];

  const now = new Date();
  const vouchers: Array<{ id: string; code: string; shopId: string }> = [];
  for (const def of voucherDefs) {
    const shop = shops[def.shopIdx];
    const startDate = new Date(now.getTime() + def.startDaysAgo * 86400000);
    const endDate = new Date(now.getTime() + def.endDaysLater * 86400000);

    const v = await prisma.voucher.upsert({
      where: { code: def.code },
      update: {
        shopId: shop.id,
        discountType: def.type,
        discountValue: def.value,
        minOrderValue: def.minOrder,
        maxDiscount: def.maxDiscount,
        quantity: def.qty,
        usedCount: def.used,
        startDate,
        endDate,
        isActive: def.qty > def.used,
      },
      create: {
        shopId: shop.id,
        code: def.code,
        discountType: def.type,
        discountValue: def.value,
        minOrderValue: def.minOrder,
        maxDiscount: def.maxDiscount ?? null,
        quantity: def.qty,
        usedCount: def.used,
        perUserLimit: 1,
        startDate,
        endDate,
        isActive: def.qty > def.used,
      },
    });
    vouchers.push(v);
  }
  console.log(`  ✅ ${vouchers.length} vouchers`);

  // ---------- PROMOTIONS ----------
  const promoDefs = [
    {
      shopIdx: 1, title: 'Flash Sale Công Nghệ', type: PromotionType.FLASH_SALE, discount: 30,
      startDaysAgo: 0, endDaysLater: 3, productIdxs: [7, 8, 12, 14],
    },
    {
      shopIdx: 0, title: 'Giảm sốc thời trang cuối tuần', type: PromotionType.FLASH_SALE, discount: 25,
      startDaysAgo: -2, endDaysLater: 5, productIdxs: [0, 2, 5],
    },
    {
      shopIdx: 2, title: 'Deal đẹp mỗi ngày', type: PromotionType.PRODUCT_DISCOUNT, discount: 20,
      startDaysAgo: -7, endDaysLater: 7, productIdxs: [15, 16, 20],
    },
    {
      shopIdx: 5, title: 'Sách giảm giá', type: PromotionType.PRODUCT_DISCOUNT, discount: 15,
      startDaysAgo: -30, endDaysLater: -5, productIdxs: [35, 36],
    },
  ];

  for (const def of promoDefs) {
    const shop = shops[def.shopIdx];
    const startDate = new Date(now.getTime() + def.startDaysAgo * 86400000);
    const endDate = new Date(now.getTime() + def.endDaysLater * 86400000);

    const promo = await prisma.promotion.create({
      data: {
        shopId: shop.id,
        title: def.title,
        type: def.type,
        discount: def.discount,
        startDate,
        endDate,
        isActive: startDate <= now && endDate >= now,
      },
    });

    for (const pIdx of def.productIdxs) {
      if (products[pIdx]) {
        await prisma.promotionProduct.upsert({
          where: { promotionId_productId: { promotionId: promo.id, productId: products[pIdx].id } },
          update: {},
          create: { promotionId: promo.id, productId: products[pIdx].id },
        });
      }
    }
  }
  console.log(`  ✅ ${promoDefs.length} promotions`);

  // ---------- CARTS ----------
  const cartUserIndices = [8, 9, 10];
  for (const idx of cartUserIndices) {
    if (idx >= users.length) continue;
    const cartUser = users[idx];
    const cart = await prisma.cart.upsert({
      where: { userId: cartUser.id },
      update: {},
      create: { userId: cartUser.id },
    });

    const itemsCount = faker.number.int({ min: 1, max: 3 });
    const usedProducts = new Set<string>();
    for (let i = 0; i < itemsCount; i++) {
      const product = faker.helpers.arrayElement(products);
      if (usedProducts.has(product.id)) continue;
      usedProducts.add(product.id);
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
        update: { quantity: faker.number.int({ min: 1, max: 3 }) },
        create: {
          cartId: cart.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 3 }),
        },
      });
    }
  }
  console.log(`  ✅ ${cartUserIndices.length} carts with items`);

  // ---------- ORDERS ----------
  const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  // Distribute orders across APPROVED shops and some users
  const approvedShops = shops.filter(s => {
    const def = shopDefs.find(d => d.slug === s.slug);
    return s.slug === 'dez-shop' || def?.status === 'APPROVED';
  });

  const orderBuyerIndices = [0, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  let orderCount = 0;

  for (let oi = 0; oi < 25; oi++) {
    const buyer = users[orderBuyerIndices[oi % orderBuyerIndices.length]];
    if (!buyer) continue;
    const shop = faker.helpers.arrayElement(approvedShops);
    const shopProducts = products.filter(p => p.shopId === shop.id);
    if (shopProducts.length === 0) continue;

    const itemCount = faker.number.int({ min: 1, max: 3 });
    const selectedProducts = faker.helpers.arrayElements(shopProducts, itemCount);
    let subtotal = 0;
    const items: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const p of selectedProducts) {
      const qty = faker.number.int({ min: 1, max: 2 });
      const pDef = productDefs.find(d => d.name === p.name);
      const price = (pDef?.salePrice ?? pDef?.price) || p.price;
      items.push({ productId: p.id, quantity: qty, price });
      subtotal += price * qty;
    }

    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const discount = 0;
    const total = subtotal - discount + shippingFee;
    const statusIdx = oi % orderStatuses.length;
    const orderDate = new Date(now.getTime() - (orderStatuses.length - statusIdx) * 86400000);

    const order = await prisma.order.create({
      data: {
        userId: buyer.id,
        shopId: shop.id,
        status: orderStatuses[statusIdx],
        subtotal,
        discount,
        shippingFee,
        total,
        shippingName: buyer.displayName,
        shippingPhone: '0900000111',
        shippingAddress: '123 Đường Seed, Quận Test, TP.HCM',
        createdAt: orderDate,
        items: {
          create: items,
        },
      },
    });
    orderCount++;

    // Apply a voucher to some orders
    if (oi % 3 === 0) {
      const shopVouchers = vouchers.filter(v => v.shopId === shop.id);
      if (shopVouchers.length > 0) {
        const v = faker.helpers.arrayElement(shopVouchers);
        const discountAmount = Math.min(faker.number.int({ min: 10000, max: 50000 }), subtotal);
        await prisma.voucherUsage.upsert({
          where: { orderId: order.id },
          update: { discount: discountAmount },
          create: {
            voucherId: v.id,
            userId: buyer.id,
            orderId: order.id,
            discount: discountAmount,
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: { discount: discountAmount, total: subtotal - discountAmount + shippingFee },
        });
      }
    }
  }
  console.log(`  ✅ ${orderCount} orders with items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
