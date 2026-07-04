# 📸 Halogram

> Halogram là một ứng dụng mạng xã hội full-stack lấy cảm hứng từ Instagram. Frontend sử dụng React + Vite, backend sử dụng NestJS + Prisma, lưu trữ dữ liệu bằng MySQL và xác thực bằng JWT.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![License](https://img.shields.io/badge/License-ISC-green)

---

## 🚀 Tổng quan

Halogram gồm hai ứng dụng tách biệt:

- `client/` — frontend React + Vite
- `server/` — backend NestJS + Prisma

Người dùng có thể:

- Đăng ký và đăng nhập bảo mật
- Tạo bài viết với nhiều hình ảnh
- Thích / bỏ thích bài viết
- Bình luận bài viết
- Gửi, chấp nhận, huỷ yêu cầu kết bạn
- Xem feed bạn bè và feed chính
- Tìm kiếm người dùng
- Upload avatar
- Hệ thống story demo

---

## ✨ Tính năng chính

### Authentication

- Đăng ký tài khoản
- Đăng nhập bằng email + password
- JWT Authentication
- Các API bảo mật bằng JWT
- Lấy thông tin user hiện tại `/me`

### User

- Xem profile
- Cập nhật profile
- Upload avatar
- Hiển thị tên và username

### Post

- Tạo bài viết
- Upload nhiều ảnh
- Feed chính và feed bạn bè
- Phân trang / infinite scroll

### Like

- Thích bài viết
- Bỏ thích bài viết
- Đếm số lượt thích

### Comment

- Bình luận bài viết
- Hiển thị danh sách bình luận
- Đếm số bình luận

### Friendship

- Gửi yêu cầu kết bạn
- Chấp nhận yêu cầu
- Từ chối / huỷ yêu cầu
- Danh sách bạn bè

### Stories

- UI story
- Xem story
- Story hiện tại dùng mock data

### Search

- Tìm kiếm người dùng

---

## 🧱 Kiến trúc dự án

```
halogram/
├── client/        # Frontend React + Vite
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   ├── locales/
│   │   ├── pages/
│   │   ├── services/
│   ├── store/
│   ├── styles/
│   ├── types/
│   └── utils/
│   ├── package.json
│   └── tsconfig.json

└── server/        # Backend NestJS + Prisma
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    ├── src/
    │   ├── auth/
    │   ├── cloudinary/
    │   ├── comments/
    │   ├── follows/
    │   ├── friendships/
    │   ├── likes/
    │   ├── messages/
    │   ├── notifications/
    │   ├── post/
    │   ├── prisma/
    │   └── users/
    ├── package.json
    └── tsconfig.json
```

---

## 🛠 Công nghệ sử dụng

### Frontend

- React 19
- Vite
- TypeScript
- TailwindCSS
- React Router DOM
- Axios
- Zustand
- React Query
- i18next
- Framer Motion
- Lucide React

### Backend

- NestJS 11
- Prisma ORM
- MySQL
- JWT
- Passport JWT
- bcrypt
- Cloudinary
- Multer
- cookie-parser
- class-validator / class-transformer

---

## 🧩 Mô hình dữ liệu chính

Backend dùng Prisma schema với các model chính:

- `User`
- `Post`
- `PostImage`
- `Comment`
- `PostLike`
- `Friendship`
- `Follow`
- `Story`
- `StoryView`

---

## 📦 Cài đặt và chạy

### 1. Cài đặt dependencies toàn bộ workspace

```bash
cd c:/project/halogram
pnpm install
```

### 2. Chạy đồng thời frontend và backend

```bash
pnpm dev
```

### 3. Chạy riêng backend

```bash
cd server
pnpm dev
```

### 4. Chạy riêng frontend

```bash
cd client
pnpm dev
```

---

## 🔧 Biến môi trường

### Backend (`server/.env`)

```env
DATABASE_URL="mysql://root:password@localhost:3306/halogram"
JWT_SECRET=your_secret_key
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
```

> Lưu ý: frontend sử dụng `VITE_API_BASE_URL` trong `client/src/api/axios.ts`.

---

## 🧪 Database và seed

### Migrate schema

```bash
cd server
pnpm exec prisma migrate dev
```

### Generate Prisma Client

```bash
cd server
pnpm exec prisma generate
```

### Seed dữ liệu (tuỳ chọn)

```bash
cd server
pnpm exec prisma db seed
```

---

## 📌 Một số điểm quan trọng

- `server/src/main.ts` bật CORS cho `http://localhost:5173` và cho phép `credentials: true`.
- `client/src/api/axios.ts` tự động gắn `Authorization: Bearer <token>` và xử lý refresh token khi gặp lỗi 401.
- `server/src/cloudinary/cloudinary.service.ts` dùng Cloudinary để upload ảnh.
- `server/src/auth` chứa các API đăng ký / đăng nhập / refresh JWT.

---

## 🧪 Scripts quan trọng

### Root

- `pnpm dev` — chạy cùng lúc frontend và backend

### Client

- `pnpm dev` — chạy frontend Vite
- `pnpm build` — build frontend
- `pnpm lint` — kiểm tra lint
- `pnpm preview` — preview build

### Server

- `pnpm dev` — chạy NestJS ở chế độ watch
- `pnpm build` — build backend
- `pnpm start` — chạy app production
- `pnpm lint` — kiểm tra lint
- `pnpm test` — chạy test
- `pnpm exec prisma migrate dev` — migrate schema
- `pnpm exec prisma generate` — tạo Prisma Client

---

## 📄 License

Dự án sử dụng license `ISC` theo cấu hình `package.json`.
