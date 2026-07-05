# 📸 Halogram

> **Halogram** is a full-stack social media application inspired by Instagram. The frontend is built with **React + Vite**, while the backend is powered by **NestJS + Prisma**. It uses **MySQL** for data storage and **JWT** for secure authentication.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![License](https://img.shields.io/badge/License-ISC-green)

---

## 🚀 Overview

Halogram is organized into two independent applications:

* `client/` — React + Vite frontend
* `server/` — NestJS + Prisma backend

The application currently supports:

* 🔐 Secure user registration and authentication
* 📝 Creating posts with multiple images
* ❤️ Like and unlike posts
* 💬 Comment on posts
* 🤝 Send, accept, reject, and cancel friend requests
* 📰 Browse both the global feed and friends feed
* 🔍 Search for users
* 👤 Upload and update profile avatars
* 📖 Story UI (currently using mock data)

> **Note:** Halogram is an ongoing personal project, and additional features and improvements are continuously being developed.

---

## ✨ Key Features

### 🔐 Authentication

* User registration
* Email & password login
* JWT-based authentication
* Protected API endpoints using JWT
* Get the currently authenticated user via `/me`

### 👤 User

* View user profiles
* Update profile information
* Upload profile avatar
* Display user profile details (display name & username)

### 📝 Posts

* Create new posts
* Upload multiple images per post
* Global feed and friends feed
* Pagination with infinite scrolling

### ❤️ Likes

* Like posts
* Unlike posts
* Display total like count

### 💬 Comments

* Add comments to posts
* Display comment list
* Display comment count

### 🤝 Friendship

* Send friend requests
* Accept friend requests
* Reject or cancel friend requests
* View friends list

### 📖 Stories

* Story user interface
* View stories
* Stories currently use mock data (backend integration coming soon)

### 🔍 Search

* Search users by username, display name, or email
* Debounced search requests for better performance
* Infinite scrolling for search results

---

## 🧱 Project Structure

```text
halogram/
├── client/        # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── locales/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json

└── server/        # NestJS Backend
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

## 🛠 Tech Stack

### Frontend

The frontend is built with a modern React ecosystem:

* React 19
* Vite
* TypeScript
* Tailwind CSS
* React Router DOM
* Axios
* Zustand
* TanStack React Query
* i18next
* Framer Motion
* Lucide React

### Backend

The backend is powered by NestJS and Prisma:

* NestJS 11
* Prisma ORM
* MySQL
* JWT Authentication
* Passport JWT
* bcrypt
* Cloudinary
* Multer
* cookie-parser
* class-validator
* class-transformer

---

## 🧩 Database Models

The backend uses **Prisma ORM** with the following core models:

* `User`
* `Post`
* `PostImage`
* `Comment`
* `PostLike`
* `Friendship`
* `Follow`
* `Story`
* `StoryView`

These models work together to provide authentication, social interactions, posts, friendships, stories, and user relationships.

---

## 📦 Installation

### 1. Install project dependencies

```bash
cd c:/project/halogram
pnpm install
```

### 2. Start both the frontend and backend

```bash
pnpm dev
```

### 3. Start the backend only

```bash
cd server
pnpm dev
```

### 4. Start the frontend only

```bash
cd client
pnpm dev
```

Once both applications are running:

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:3000`

---

## 🔧 Environment Variables

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

> **Note:** The frontend uses `VITE_API_BASE_URL` in `client/src/api/axios.ts` to communicate with the backend API.

## 🗄️ Database & Seeding

### Run Database Migrations

```bash
cd server
pnpm exec prisma migrate dev
```

### Generate Prisma Client

```bash
cd server
pnpm exec prisma generate
```

### Seed the Database (Optional)

```bash
cd server
pnpm exec prisma db seed
```

---

## 📌 Important Notes

* `server/src/main.ts` enables CORS for `http://localhost:5173` and allows `credentials: true`.
* `client/src/api/axios.ts` automatically attaches the `Authorization: Bearer <token>` header and handles authentication errors.
* `server/src/cloudinary/cloudinary.service.ts` is responsible for uploading and managing images with Cloudinary.
* `server/src/auth` contains all authentication-related endpoints, including **Sign Up**, **Sign In**, **JWT Authentication**, and **Refresh Token**.

---

## 🧪 Available Scripts

### Root Workspace

| Command    | Description                                    |
| ---------- | ---------------------------------------------- |
| `pnpm dev` | Run both the frontend and backend concurrently |

### Client

| Command        | Description                       |
| -------------- | --------------------------------- |
| `pnpm dev`     | Start the Vite development server |
| `pnpm build`   | Build the frontend for production |
| `pnpm lint`    | Run ESLint                        |
| `pnpm preview` | Preview the production build      |

### Server

| Command                        | Description                |
| ------------------------------ | -------------------------- |
| `pnpm dev`                     | Start NestJS in watch mode |
| `pnpm build`                   | Build the backend          |
| `pnpm start`                   | Run the production server  |
| `pnpm lint`                    | Run ESLint                 |
| `pnpm test`                    | Run unit tests             |
| `pnpm exec prisma migrate dev` | Apply database migrations  |
| `pnpm exec prisma generate`    | Generate the Prisma Client |

---

# 📊 Mermaid Diagrams

The following diagrams illustrate the core workflows of the application.

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant API as Auth API
    participant DB as Prisma/MySQL

    U->>C: Enter email and password
    C->>API: Send login request
    API->>DB: Validate credentials
    DB-->>API: Return user information
    API-->>C: Return access token & refresh token
    C-->>U: Login successful
```

---

## 2. Post Creation & Feed Flow

```mermaid
flowchart LR

U[User]
--> UI[Create Post Form]

UI
--> API[Post API]

API
--> DB[(Prisma Database)]

DB
--> FEED[Global Feed / Friends Feed]

FEED
--> RENDER[Render Posts]
```

---

## 3. User Search & Friendship Flow

```mermaid
flowchart TD

User[User]

Search[Search Page]

API[Users Search API]

Service[Users Service]

DB[(Prisma Database)]

Result[Search Results]

Friendship[Friendship Service]

User --> Search

Search --> API

API --> Service

Service --> DB

DB --> Result

Result --> Friendship

Friendship --> DB
```

---

## 4. Post Interaction Flow

```mermaid
flowchart TD

User[User]

Post[Open Post]

Like[Like / Unlike]

Comment[Comment]

LikeAPI[Post Like API]

CommentAPI[Comment API]

DB[(Prisma Database)]

Update[Update UI]

User --> Post

Post --> Like

Post --> Comment

Like --> LikeAPI

Comment --> CommentAPI

LikeAPI --> DB

CommentAPI --> DB

DB --> Update
```

---

## 📄 License

This project is licensed under the **ISC License**, as specified in the project's `package.json`.
