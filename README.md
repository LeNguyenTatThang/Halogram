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

* 🔐 Secure user registration and authentication with JWT access + refresh tokens
* 📝 Creating posts with multiple images
* ❤️ Like and unlike posts
* 💬 Comment on posts
* 🤝 Send, accept, reject, and cancel friend requests
* 📰 Browse both the global feed and friends feed
* 🔍 Search for users
* 👤 Upload and update profile avatars
* 📖 Story UI (currently using mock data)
* 💬 Real-time chat with Socket.IO
* 📞 Audio/video calls with WebRTC
* 📺 Livestreaming with WebRTC + Socket.IO
* 🏪 Halo Shop: seller center, products, categories, cart

> **Note:** Halogram is an ongoing personal project, and additional features and improvements are continuously being developed.

---

## ✨ Key Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication with access token (15 min) + refresh token (7 days)
* HTTP-only cookie for refresh token
* Protected API endpoints using Passport JWT Guard
* Get the currently authenticated user via `/me`
* Token refresh mechanism

### 👤 User

* View user profiles
* Update profile information
* Upload profile avatar
* Display user profile details (display name & username)
* Search users by username, display name, or email

### 📝 Posts

* Create new posts with multiple images
* Like and unlike posts
* Comment on posts
* Global feed and friends feed
* Pagination with infinite scrolling
* Tag users in posts

### 🤝 Friendship

* Send friend requests
* Accept friend requests
* Reject or cancel friend requests
* Block/unblock users
* View friends list

### 👥 Follow

* Follow/unfollow users
* Follower and following lists

### 📖 Stories

* Story user interface
* View stories
* Stories currently use mock data (backend integration coming soon)

### 💬 Real-Time Chat

* Send and receive messages via Socket.IO
* Conversation management
* Typing indicators
* Message history with pagination

### 📞 Audio/Video Calls

* WebRTC peer-to-peer audio/video calls
* Socket.IO signaling (offer, answer, ICE candidates)
* Incoming call notifications
* Mute and camera controls

### 📺 Livestream

* WebRTC-based livestreaming
* Real-time viewer count
* Livestream chat
* Viewer WebRTC signaling (offer/answer/ICE)

### 🏪 Halo Shop

* Seller center with dashboard
* Product management (create, edit, delete)
* Product categories
* Product search and filtering
* Shopping cart
* Shop verification system

### 🔍 Search

* Search users by username, display name, or email
* Debounced search requests
* Infinite scrolling for search results

### 🔔 Notifications

* Real-time notifications via Socket.IO
* Like, comment, follow, friend request notifications
* Read/unread status

---

## 🧱 Project Structure

```text
halogram/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── api/                     # Axios configuration & interceptors
│   │   ├── assets/                  # Static assets (images, sounds)
│   │   ├── components/              # Reusable UI components
│   │   │   ├── call/                # Incoming call modal
│   │   │   ├── common/              # StoryViewer, VerifiedBadge, LazyImage
│   │   │   ├── livestream/          # LivestreamCard, LivestreamChat
│   │   │   ├── post/                # TagFriendsModal
│   │   │   ├── profile/             # EditProfileModal, EditPostModal
│   │   │   ├── shop/                # ProductCard, ProductGrid, CategoryList
│   │   │   └── ui/                  # HalogramLoading, UserAvatar
│   │   ├── context/                 # React contexts
│   │   │   ├── AuthProvider.tsx      # Authentication state & token management
│   │   │   ├── ChatContext.tsx       # Real-time chat state
│   │   │   ├── CallContext.tsx       # WebRTC call state & signaling
│   │   │   └── NotificationContext.tsx
│   │   ├── hooks/                   # Custom hooks
│   │   ├── layouts/                 # MainLayout, Online layout, ChatWindow
│   │   ├── lib/                     # Socket.IO client, i18n
│   │   ├── locales/                 # English & Vietnamese translations
│   │   ├── pages/                   # Route pages
│   │   │   ├── auth/                # Login, Signup
│   │   │   ├── post/                # Feed, CreatePost, Post detail
│   │   │   ├── shop/                # HaloShop, ProductManage/Create/Edit
│   │   │   ├── user/                # Profile, Stories
│   │   │   ├── livestream/          # LivestreamPage, Broadcast, Viewer
│   │   │   ├── notifications/       # Notifications list
│   │   │   └── search/              # User search
│   │   ├── services/                # Auth service
│   │   ├── types/                   # TypeScript interfaces
│   │   └── utils/                   # API helpers per module
│   ├── package.json
│   └── vite.config.ts

└── server/                          # NestJS Backend
    ├── prisma/
    │   ├── schema.prisma            # Database schema (31 models)
    │   └── seed.ts                  # Database seeder
    ├── src/
    │   ├── auth/                    # Authentication module
    │   │   ├── auth.controller.ts   # Login, signup, refresh, logout, /me
    │   │   ├── auth.service.ts      # JWT generation, password hashing
    │   │   ├── guards/              # JwtAuthGuard, WsJwtGuard
    │   │   ├── strategies/          # Passport JWT strategy
    │   │   ├── decorators/          # @CurrentUser decorator
    │   │   └── dto/                 # SignInDto, SignUpDto
    │   ├── users/                   # User profiles, search
    │   ├── post/                    # Posts CRUD, feeds
    │   ├── comments/                # Comments CRUD
    │   ├── likes/                   # Like/unlike posts
    │   ├── follows/                 # Follow/unfollow users
    │   ├── friendships/             # Friend requests, accept, reject, block
    │   ├── messages/                # Conversations & messages (REST + WebSocket)
    │   │   └── gateways/            # MessagesGateway (Socket.IO)
    │   ├── notifications/           # Notifications (REST + WebSocket)
    │   │   └── notifications.gateway.ts
    │   ├── call/                    # WebRTC signaling (Socket.IO)
    │   │   └── call.gateway.ts
    │   ├── livestream/              # Livestream (REST + WebSocket)
    │   │   └── livestream.gateway.ts
    │   ├── online/                  # Online status (Socket.IO)
    │   │   └── online.gateway.ts
    │   ├── shop/                    # Halo Shop module
    │   │   ├── shop.controller.ts   # Shop CRUD + verification
    │   │   ├── product.controller.ts
    │   │   ├── cart.controller.ts
    │   │   └── category.controller.ts
    │   ├── cloudinary/              # Image upload service
    │   ├── common/                  # Interceptors, transformers, response types
    │   ├── prisma/                  # Prisma service (singleton)
    │   └── app.module.ts            # Root module
    ├── package.json
    └── tsconfig.json
```

---

## 🛠 Tech Stack

### Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS
* React Router DOM
* Axios
* Zustand
* TanStack React Query
* Socket.IO Client
* i18next
* Framer Motion
* Lucide React

### Backend

* NestJS 11
* Prisma ORM
* MySQL
* JWT Authentication (Passport)
* bcrypt
* Socket.IO (WebSocket gateway)
* WebRTC (calls + livestream)
* Cloudinary (image upload)
* cookie-parser
* class-validator / class-transformer

---

## 📦 Installation

### 1. Install project dependencies

```bash
cd c:/project/halogram
pnpm install
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run database migrations

```bash
cd server
pnpm exec prisma migrate dev
```

### 4. Start both the frontend and backend

```bash
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
REFRESH_TOKEN_SECRET=your_refresh_secret
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
```

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

## 🏗️ Architecture

### System Architecture

```mermaid
flowchart TB
    subgraph Client["React Client"]
        UI[React UI Components]
        CTX[Contexts: Auth, Chat, Call, Notification]
        SOCK[Socket.IO Client]
        API_CLIENT[Axios HTTP Client]
    end

    subgraph Server["NestJS Backend"]
        REST[NestJS REST Controllers]
        WS[WebSocket Gateways]
        subgraph Gateways["Socket.IO Gateways (namespace: haloggram)"]
            MG[MessagesGateway]
            CG[CallGateway]
            LG[LivestreamGateway]
            OG[OnlineGateway]
            NG[NotificationsGateway]
        end
        GUARD[JWT Auth Guard]
        VAL[ValidationPipe]
        INTER[ResponseInterceptor]
        SVC[Application Services]
    end

    subgraph Data["Data Layer"]
        PRISMA[Prisma ORM]
        DB[(MySQL Database)]
        CDN[Cloudinary Image Storage]
    end

    Client -->|HTTP REST| REST
    Client -->|WebSocket| WS
    REST --> GUARD
    REST --> VAL
    REST --> INTER
    REST --> SVC
    WS --> Gateways
    Gateways --> SVC
    SVC --> PRISMA
    PRISMA --> DB
    SVC --> CDN
```

---

### Authentication Flow

The authentication flow uses JWT with access and refresh tokens. The access token (15 min) is stored in `localStorage` on the client and sent as an `Authorization: Bearer` header. The refresh token (7 days) is stored in an HTTP-only cookie and used to obtain new access tokens without requiring re-login.

```mermaid
sequenceDiagram
    participant U as User
    participant C as React Client
    participant API as Auth API
    participant DB as Database

    U->>C: Enter email & password
    C->>API: POST /auth/login
    API->>DB: Find user by email/username
    DB-->>API: User found
    API->>DB: Compare bcrypt hash
    DB-->>API: Valid
    API->>API: Generate JWT payload { sub, email, username }
    API-->>C: { accessToken (15m), refreshToken (7d in httpOnly cookie) }
    C->>C: Store accessToken in localStorage
    C-->>U: Login successful

    Note over C,API: On 401, client uses refresh token
    C->>API: POST /auth/refresh (cookie)
    API->>API: Verify refresh JWT
    API->>DB: Compare stored hash
    DB-->>API: Matches
    API-->>C: { new accessToken }
```

---

### Authorization Flow

All protected endpoints apply `@UseGuards(JwtAuthGuard)` which uses Passport's JWT strategy. The strategy extracts the token from the `Authorization: Bearer` header, verifies it against `JWT_SECRET`, and attaches the decoded user to `request.user`. Services then perform ownership checks where needed.

```mermaid
flowchart TD
    REQ[HTTP Request with Authorization Header]
    JWT[Passport JWT Strategy]
    GUARD[JwtAuthGuard]
    DEC[@CurrentUser Decorator]
    CTRL[Controller]
    SVC[Service]
    OWN[Ownership Check<br/>e.g. post.userId === userId]
    DB[(Database)]

    REQ --> JWT
    JWT --> GUARD
    GUARD -->|Decoded user attached to request| CTRL
    DEC -->|Inject user into handler| CTRL
    CTRL --> SVC
    SVC --> OWN
    OWN --> DB
```

---

### API Request Flow

Every API request passes through NestJS's global pipeline: CORS → cookie-parser → ValidationPipe (whitelist, forbidNonWhitelisted, transform) → Guard → Controller → Service → ResponseInterceptor.

```mermaid
flowchart LR
    C[React Client]
    AXI[Axios Instance]
    CORS[CORS Middleware]
    COOK[cookie-parser]
    VAL[ValidationPipe<br/>whitelist + transform]
    JWT[JwtAuthGuard]
    CTRL[Controller]
    SVC[Service]
    INT[ResponseInterceptor<br/>{ status, message, data }]
    DB[(Database)]

    C --> AXI
    AXI --> CORS
    CORS --> COOK
    COOK --> VAL
    VAL --> JWT
    JWT --> CTRL
    CTRL --> SVC
    SVC --> DB
    DB --> SVC
    SVC --> CTRL
    CTRL --> INT
    INT --> C
```

---

### Database Architecture

The database schema defines **31 models** covering authentication, social features, messaging, calls, livestreaming, and e-commerce.

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    USER ||--o{ POST_LIKE : likes
    USER ||--o{ FOLLOW : follows
    USER ||--o{ FOLLOW : followed_by
    USER ||--o{ FRIENDSHIP : sends_request
    USER ||--o{ FRIENDSHIP : receives_request
    USER ||--o{ STORY : creates
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ NOTIFICATION : acts
    USER ||--o{ CONVERSATION_MEMBER : participates
    USER ||--o{ MESSAGE : sends
    USER ||--o{ CALL : makes
    USER ||--o{ CALL : receives
    USER ||--o{ LIVESTREAM : streams
    USER ||--o{ ORDER : places
    USER ||--o| SHOP : owns
    USER ||--o| CART : has

    POST ||--o{ COMMENT : has
    POST ||--o{ POST_LIKE : receives
    POST ||--o{ POST_IMAGE : contains
    POST ||--o{ POST_TAG : tags
    POST ||--o{ SAVED_POST : saved_by

    CONVERSATION ||--o{ CONVERSATION_MEMBER : has
    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION ||--o{ CALL : has

    SHOP ||--o{ PRODUCT : sells
    SHOP ||--o{ VOUCHER : offers
    SHOP ||--o{ PROMOTION : runs
    SHOP ||--o{ ORDER : receives
    SHOP ||--| SHOP_VERIFICATION : has

    PRODUCT ||--o{ PRODUCT_IMAGE : has
    PRODUCT ||--o{ PRODUCT_VARIANT : has_variants
    PRODUCT ||--o{ CART_ITEM : added_to_cart
    PRODUCT ||--o{ ORDER_ITEM : included_in
    PRODUCT }|--|| CATEGORY : belongs_to

    CART ||--o{ CART_ITEM : contains

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--o| VOUCHER_USAGE : applies

    VOUCHER ||--o{ VOUCHER_USAGE : redeemed

    LIVESTREAM ||--o{ LIVESTREAM_MESSAGE : has_chat
```

---

### Social Relationship Flow

Halogram has two parallel social relationship systems: **Follow** (one-way, public) and **Friendship** (two-way, mutual accept required).

```mermaid
flowchart LR
    A[User A]
    B[User B]

    A -->|Follows| B
    Note over A,B: Follow is one-way.<br/>User A sees User B's public posts.

    A -->|Sends Friend Request| B
    B -->|Accepts| A
    Note over A,B: Friendship is mutual.<br/>Both see each other's friends-only posts.
```

---

### Post Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant API as Post API
    participant DB as Database

    U->>C: Create post with images
    C->>C: Upload images to Cloudinary
    C->>API: POST /post/createPost
    API->>DB: Store post + images
    DB-->>API: Post created

    U->>C: Like post
    C->>API: POST /post/like
    API->>DB: Toggle like
    DB-->>API: { liked, count }

    U->>C: Comment on post
    C->>API: POST /comment/createComment
    API->>DB: Create comment
    DB-->>API: Comment created

    U->>C: View feed
    C->>API: GET /post/listPost
    API->>DB: Query posts with cursor pagination
    DB-->>API: Posts list
```

---

### Real-Time Chat Architecture

Chat uses Socket.IO for real-time bidirectional communication and REST APIs for history persistence. All gateways share the `haloggram` namespace.

```mermaid
sequenceDiagram
    participant A as User A
    participant C as Chat Client
    participant WS as Socket.IO Gateway
    participant SVC as Message Service
    participant DB as Database
    participant B as User B

    A->>C: Send message
    C->>WS: socket.emit('sendMessage', { conversationId, message })
    Note over WS: Currently broadcasts directly<br/>without saving to DB
    WS-->>B: socket.on('receiveMessage', payload)

    B->>C: Typing
    C->>WS: socket.emit('typing', { conversationId, userId })
    WS-->>A: socket.on('typing', payload)

    Note over A,B: REST API for message history
    A->>C: Load conversation history
    C->>SVC: GET /messages?conversationId=xxx&cursor=yyy
    SVC->>DB: Query messages with cursor pagination
    DB-->>SVC: Message list
    SVC-->>C: Messages with user info
```

#### WebSocket Events (namespace: `haloggram`)

| Event | Direction | Gateway | Description |
|---|---|---|---|
| `joinConversation` | Client→Server | MessagesGateway | Join a conversation room |
| `leaveConversation` | Client→Server | MessagesGateway | Leave a conversation room |
| `sendMessage` | Client→Server | MessagesGateway | Send a message (currently broadcast-only) |
| `typing` / `stopTyping` | Client→Server | MessagesGateway | Typing indicators |
| `callUser` | Client→Server | CallGateway | Initiate a call to a user |
| `acceptCall` / `rejectCall` | Client→Server | CallGateway | Accept/reject incoming call |
| `offer` / `answer` | Client→Server | CallGateway | WebRTC SDP exchange |
| `iceCandidate` | Client→Server | CallGateway | WebRTC ICE candidate exchange |
| `endCall` | Client→Server | CallGateway | End an active call |
| `joinCall` / `leaveCall` | Client→Server | CallGateway | Join/leave call room |
| `livestream:join` | Client→Server | LivestreamGateway | Join a livestream room |
| `livestream:leave` | Client→Server | LivestreamGateway | Leave a livestream room |
| `livestream:chat-message` | Client→Server | LivestreamGateway | Send chat in livestream |
| `livestream:viewer-offer` | Client→Server | LivestreamGateway | Viewer WebRTC offer |
| `livestream:streamer-answer` | Client→Server | LivestreamGateway | Streamer WebRTC answer |
| `livestream:ice-candidate` | Client→Server | LivestreamGateway | ICE candidate relay |
| `livestream:end` | Client→Server | LivestreamGateway | End a livestream |
| `getOnlineUsers` | Client→Server | OnlineGateway | Get list of online users |
| `receiveMessage` | Server→Client | MessagesGateway | New message received |
| `notification:new` | Server→Client | NotificationsGateway | New notification |
| `incomingCall` | Server→Client | CallGateway | Incoming call notification |
| `callAccepted` / `callRejected` / `callEnded` | Server→Client | CallGateway | Call status updates |
| `userOnline` / `userOffline` | Server→Client | OnlineGateway | User online status change |
| `onlineUsers` | Server→Client | OnlineGateway | Current online user list |

---

### WebRTC Call Flow

Audio/video calls use WebRTC peer-to-peer connections with Socket.IO signaling. No media server or TURN server is currently implemented.

```mermaid
sequenceDiagram
    participant A as Caller
    participant C_A as Caller Client
    participant WS as Socket.IO Gateway
    participant C_B as Callee Client
    participant B as Callee

    A->>C_A: Call user
    C_A->>WS: socket.emit('callUser', { roomId, receiverId, callerId, type })
    WS->>C_B: socket.on('incomingCall', payload)
    C_B-->>B: Show incoming call UI

    B->>C_B: Accept call
    C_B->>WS: socket.emit('acceptCall', payload)
    WS->>C_A: socket.on('callAccepted')
    C_A->>C_A: Create RTCPeerConnection + local stream
    C_A->>C_A: Create SDP offer
    C_A->>WS: socket.emit('offer', { roomId, offer })
    WS->>C_B: socket.on('offer', payload)
    C_B->>C_B: Create RTCPeerConnection + local stream
    C_B->>C_B: Set remote description + create answer
    C_B->>WS: socket.emit('answer', { roomId, answer })
    WS->>C_A: socket.on('answer', payload)

    C_A->>C_A: Set remote description
    loop ICE Candidates
        C_A->>WS: socket.emit('iceCandidate', { roomId, candidate })
        WS->>C_B: socket.on('iceCandidate', payload)
        C_B->>C_B: Add ICE candidate
        C_B->>WS: socket.emit('iceCandidate', { roomId, candidate })
        WS->>C_A: socket.on('iceCandidate', payload)
        C_A->>C_A: Add ICE candidate
    end

    Note over C_A,C_B: Peer-to-peer media stream established
```

---

### Livestream Architecture

Livestream uses WebRTC for media transmission between streamer and viewers, with Socket.IO for signaling and chat. The streamer sends their media to each connected viewer via WebRTC (one-to-many).

**Current Status:** Livestream WebRTC signaling is implemented on both client and server. Viewer offer/answer relay works via the gateway. No SFU/MCU media server is used — each viewer receives a direct peer connection from the streamer.

```mermaid
sequenceDiagram
    participant S as Streamer
    participant WS as Socket.IO Gateway
    participant SVC as Livestream Service
    participant DB as Database
    participant V as Viewer

    S->>WS: Start livestream (REST POST /livestream)
    WS->>SVC: Create livestream record
    SVC->>DB: Insert livestream
    DB-->>SVC: Livestream created

    V->>WS: socket.emit('livestream:join', { livestreamId })
    WS->>SVC: Verify livestream is LIVE
    SVC-->>WS: Valid
    WS->>WS: Join room, track viewers
    WS-->>V: Viewer joined
    WS-->>S: New viewer connected (with socketId)

    S->>WS: livestream:viewer-offer (WebRTC offer for viewer)
    WS->>V: relay offer to viewer

    V->>WS: livestream:streamer-answer (WebRTC answer)
    WS->>S: relay answer to streamer

    loop ICE Candidates
        S->>WS: livestream:ice-candidate
        WS->>V: relay candidate
        V->>WS: livestream:ice-candidate
        WS->>S: relay candidate
    end

    Note over S,V: Direct WebRTC media stream

    V->>WS: socket.emit('livestream:chat-message', { livestreamId, content })
    WS->>SVC: Add message to DB
    SVC-->>WS: Message saved
    WS-->>S: Broadcast chat to room
    WS-->>V: Broadcast chat to room

    S->>WS: socket.emit('livestream:end', { livestreamId })
    WS->>SVC: End stream (ownership check)
    WS->>WS: Remove all viewers from room
```

---

### Notification Architecture

Notifications are created server-side when a user action occurs (like, comment, follow, friend request) and delivered in real-time via Socket.IO.

```mermaid
flowchart LR
    ACT[User Action<br/>Like / Comment / Follow / Friend Request]
    SVC[Notification Service]
    DB[(Notification Database)]
    WS[NotificationsGateway]
    SOCK[Socket.IO<br/>emit to recipient's user room]
    UI[Notification UI]

    ACT --> SVC
    SVC --> DB
    SVC --> WS
    WS -->|emitNotification(recipientId, payload)| SOCK
    SOCK --> UI
```

---

### Halo Shop Architecture

The Halo Shop module provides e-commerce functionality with seller verification, product management, cart, and order system. Order processing is pending implementation.

```mermaid
flowchart TD
    USER[User]
    SHOP[Shop]
    VERIF[ShopVerification]
    CAT[Category]
    PROD[Product]
    VAR[ProductVariant]
    IMG[ProductImage]
    CART[Cart]
    ITEM[CartItem]
    VOUCH[Voucher]

    USER -->|owns| SHOP
    SHOP -->|has| VERIF
    SHOP -->|sells| PROD
    CAT -->|classifies| PROD
    PROD -->|has variants| VAR
    PROD -->|has images| IMG
    USER -->|has| CART
    CART -->|contains| ITEM
    ITEM -->|references| PROD
    SHOP -->|offers| VOUCH
```

---

### Order Status Flow

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> CONFIRMED
    CONFIRMED --> PROCESSING
    PROCESSING --> SHIPPING
    SHIPPING --> DELIVERED
    DELIVERED --> COMPLETED

    PENDING --> CANCELLED
    CONFIRMED --> CANCELLED

    note right of PENDING
        Order created but not
        yet confirmed by seller
    end note

    note right of COMPLETED
        Final state
    end note

    note right of CANCELLED
        Final state
    end note
```

> **Note:** The Order module's controllers and services are not yet fully implemented. The Prisma schema defines `Order`, `OrderItem`, and `VoucherUsage` models, but the REST endpoints and business logic are pending.

---

## 🔐 Security Architecture

Halogram implements multiple security layers including JWT authentication, input validation via class-validator, and resource ownership checks.

```mermaid
flowchart TD
    C[Client Request]
    CORS[CORS Filter<br/>env-configured origins]
    JWT[JWT Bearer Token<br/>Passport Strategy]
    VAL[ValidationPipe<br/>whitelist + forbidNonWhitelisted]
    AUTH[JwtAuthGuard]
    CTRL[Controller]
    OWN[Service-Level<br/>Ownership Checks]
    DB[(Database)]
    INT[ResponseInterceptor<br/>Unified response format]

    C --> CORS
    CORS --> JWT
    JWT --> VAL
    VAL --> AUTH
    AUTH --> CTRL
    CTRL --> OWN
    OWN --> DB
    DB --> CTRL
    CTRL --> INT
    INT --> C
```

### Security Layers

| Layer | Implementation | Status |
|---|---|---|
| **Authentication** | JWT access token (15m) + refresh token (7d) | ✅ Implemented |
| **Authorization** | JwtAuthGuard on protected endpoints | ✅ Implemented |
| **Input Validation** | Global ValidationPipe with whitelist + class-validator DTOs | ✅ Implemented |
| **Ownership Checks** | Service-level verification (post.userId, product.shop.ownerId, etc.) | ⚠️ Partial |
| **WebSocket Auth** | JWT verification on socket handshake | ⚠️ No per-event guards |
| **CORS** | Configurable via `CORS_ORIGINS` env variable | ✅ Implemented |
| **Rate Limiting** | Not implemented | ❌ Missing |
| **CSRF Protection** | Not implemented | ❌ Missing |
| **Security Headers** | Not implemented (no Helmet) | ❌ Missing |

For a detailed security analysis including all vulnerabilities, see:

👉 [Security Audit Report](./SECURITY-AUDIT.md)

---

## 🔄 Complete System Flow

```mermaid
flowchart TB
    USER[User]
    CLIENT[React Client<br/>Port 5173]

    subgraph Frontend["Frontend Layer"]
        UI[React UI]
        CTX[Auth / Chat / Call / Notification Contexts]
        SOCK[Socket.IO Client]
        AXI[Axios HTTP Client]
    end

    subgraph Backend["Backend Layer (NestJS Port 3000)"]
        REST[REST Controllers<br/>Auth / Users / Post / Comment / Like<br/>Follow / Friendship / Shop / Cart<br/>Messages / Notifications / Livestream]
        WS[WebSocket Gateways<br/>Messages / Call / Livestream<br/>Online / Notifications]
        GUARD[JwtAuthGuard + Passport Strategy]
        PIPE[ValidationPipe + ResponseInterceptor]
        SVC[Services with Ownership Checks]
    end

    subgraph Data["Data Layer"]
        PRISMA[Prisma ORM<br/>31 Models]
        DB[(MySQL Database)]
        CDN[Cloudinary<br/>Image Upload]
    end

    USER --> CLIENT
    CLIENT --> UI
    UI --> CTX
    CTX --> AXI
    CTX --> SOCK
    AXI --> REST
    SOCK --> WS
    REST --> GUARD
    REST --> PIPE
    REST --> SVC
    WS --> SVC
    SVC --> PRISMA
    PRISMA --> DB
    SVC --> CDN
```

---

## 📌 Important Notes

* `server/src/main.ts` enables CORS with configurable origins from environment variables and allows `credentials: true`.
* `client/src/api/axios.ts` automatically attaches the `Authorization: Bearer <token>` header and handles 401 token refresh.
* `server/src/cloudinary/cloudinary.service.ts` is responsible for uploading and managing images with Cloudinary.
* `server/src/auth` contains all authentication-related endpoints, including Sign Up, Sign In, JWT Authentication, and Refresh Token.
* All WebSocket gateways share the namespace `haloggram` and authenticate via JWT during `handleConnection`.
* WebRTC calls use direct peer-to-peer connections. No TURN server is configured — connections may fail in restrictive NAT environments.

---

## 📄 License

This project is licensed under the **ISC License**, as specified in the project's `package.json`.
