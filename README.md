# 📸 Halogram

> A modern social media application inspired by Instagram, built with React, NestJS, Prisma, MySQL, and JWT Authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 Introduction

Halogram is a full-stack social media application inspired by Instagram.

Users can:

- Register and Login securely
- Create posts with multiple images
- Like and comment on posts
- Send and accept friend requests
- Browse friends' posts
- Infinite scrolling feed
- Upload avatars
- View profiles
- JWT Authentication
- Responsive UI

The project is divided into two independent applications:

```
halogram/
│
├── client/        React + Vite
│
└── server/        NestJS + Prisma
```

---

# ✨ Features

## Authentication

- Register
- Login
- JWT Authentication
- Protected Routes
- Current User (/me)

---

## User

- View profile
- Update profile
- Upload avatar
- Display name
- Username

---

## Friend

- Send friend request
- Accept request
- Reject request
- Cancel request
- Friend list

---

## Post

- Create post
- Multiple images
- Feed
- Friend feed
- Pagination
- Infinite Scroll

---

## Like

- Like post
- Unlike post
- Like count

---

## Comment

- Create comment
- Display comments
- Comment count

---

## Stories

- Story UI
- Story Viewer

(Currently mock data)

---

## Search

- Search users

---

## Notifications

UI completed.

Backend coming soon.

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- TypeScript
- React Router
- Axios
- TailwindCSS
- Lucide React

---

## Backend

- NestJS
- Prisma ORM
- JWT
- Passport
- bcrypt
- MySQL

---

## Database

- MySQL

---

# 📂 Project Structure

```
halogram
│
├── client
│   ├── src
│   │
│   ├── components
│   ├── hooks
│   ├── layouts
│   ├── pages
│   ├── services
│   ├── store
│   ├── types
│   ├── utils
│   └── App.tsx
│
└── server
    ├── prisma
    │
    ├── src
    │
    ├── auth
    ├── comment
    ├── friendship
    ├── image
    ├── like
    ├── post
    ├── upload
    └── user
```

---

# 🗄 Database

Main Tables

```
User

Post

Image

Comment

Like

Friendship
```

Relationship

```
User
 ├── Posts
 ├── Likes
 ├── Comments
 ├── Friendships
 └── Avatar
```

---

# 🚀 Installation

## 1 Clone Repository

```bash
git clone https://github.com/LeNguyenTatThang/Halogram
```

```
cd halogram
```

---

# Backend Setup

Go to server

```bash
cd server
```

Install dependencies

```bash
npm install
```

Create .env

```env
DATABASE_URL="mysql://root:password@localhost:3306/halogram"

JWT_SECRET=your_secret

PORT=3000
```

Run migration

```bash
npx prisma migrate dev
```

Generate Prisma Client

```bash
npx prisma generate
```

Seed database (optional)

```bash
npm run seed
```

Start backend

```bash
npm run start:dev
```

Server

```
http://localhost:3000
```

---

# Frontend Setup

Go to client

```bash
cd client
```

Install packages

```bash
npm install
```

Create .env

```env
VITE_API_URL=http://localhost:3000
```

Run

```bash
npm run dev
```

Client

```
http://localhost:5173
```

---

# Authentication Flow

```
Login

↓

Server validates account

↓

JWT Token

↓

LocalStorage

↓

Axios Interceptor

↓

Authorization Header

↓

Protected API
```

---

# Feed Pagination

Cursor Pagination

```
GET

/post/list-post?cursor=postId
```

Response

```json
{
  "success": true,
  "posts": [],
  "nextCursor": "post_id"
}
```

Infinite Scroll

```
Load first page

↓

Render posts

↓

Reach bottom

↓

IntersectionObserver

↓

Fetch next page

↓

Append posts

↓

Repeat
```

---

# API Overview

## Auth

```
POST /auth/register

POST /auth/login

GET /auth/me
```

---

## User

```
GET /user/profile

PATCH /user/update

POST /user/avatar
```

---

## Friend

```
POST /friend/request

PATCH /friend/accept

PATCH /friend/reject

DELETE /friend/cancel

GET /friend/list
```

---

## Post

```
POST /post/create

GET /post/list-post

GET /post/:id

DELETE /post/:id
```

---

## Like

```
POST /like

DELETE /like
```

---

## Comment

```
POST /comment

GET /comment/:postId
```

---

# Screenshots

```
Login

Feed

Create Post

Profile

Stories

Search

Notifications
```

(Add screenshots here.)

---

# Future Improvements

- Realtime Chat
- Story Upload
- Story Expiration
- Follow System
- Video Posts
- Saved Posts
- Explore Page
- Dark Mode
- Notifications
- Socket.io
- Cloudinary
- AWS S3
- Docker
- CI/CD
- Unit Testing
- E2E Testing

---

# Scripts

## Backend

```bash
npm run start:dev

npm run build

npm run lint

npm run test

npm run prisma:generate

npm run prisma:migrate
```

## Frontend

```bash
npm run dev

npm run build

npm run preview

npm run lint
```

---

# Environment Variables

Backend

```env
DATABASE_URL=

JWT_SECRET=

PORT=
```

Frontend

```env
VITE_API_URL=
```

---

# Built With

- React
- Vite
- TypeScript
- TailwindCSS
- NestJS
- Prisma
- MySQL
- JWT
- Axios

---

# Author

**Dez**

Full Stack Developer

GitHub:
https://github.com/LeNguyenTatThang

---

# License

This project is licensed under the MIT License.