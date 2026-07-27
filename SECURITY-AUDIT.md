# Security Audit Report — Halogram

> Generated: 2026-07-28

## Overview

This document catalogs all security findings discovered during a comprehensive audit of the Halogram codebase. Finding statuses are updated as remediation progresses.

**Status Legend:** `FIXED` | `PARTIALLY_FIXED` | `OPEN` | `FALSE_POSITIVE`

---

## Rate Limiting

### RATE-001: Missing rate limiting on auth endpoints

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | FIXED |
| **Location** | `server/src/app.module.ts`, `server/src/auth/auth.controller.ts`, `server/src/auth/auth.module.ts` |
| **Description** | `@nestjs/throttler@6.5.0` was installed but not configured. `ThrottlerModule` was imported in `auth.module.ts` without `.forRoot()`. The `@Throttle()` decorator used incorrect syntax for v6 (`{ limit: 5, ttl: 60 }` instead of `{ default: { limit: 5, ttl: 60000 } }`). |
| **Fix** | Moved `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])` to `app.module.ts` with `ThrottlerGuard` as global `APP_GUARD`. Fixed `@Throttle()` syntax in `auth.controller.ts`. Removed unconfigured `ThrottlerModule` import from `auth.module.ts`. |
| **Verification** | Verified that `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])` is in `app.module.ts` imports. `ThrottlerGuard` is provided globally via `APP_GUARD`. `auth.controller.ts` has `@Throttle({ default: { limit: 5, ttl: 60000 } })` on both `login` and `sign-up`. `auth.module.ts` no longer imports `ThrottlerModule`. The `refreshToken` endpoint has no `@Throttle()` override but is covered by the global limit (10 req/60s). |

---

## Admin Authorization

### ADMIN-001: Shop verification endpoints — no admin guard

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Status** | FIXED |
| **Location** | `server/src/shop/shop.controller.ts`, `server/src/auth/guards/admin.guard.ts` |
| **Description** | `GET /shop/verifications/pending`, `POST /shop/verifications/:shopId/approve`, and `POST /shop/verifications/:shopId/reject` had no admin/role check. |
| **Fix** | Added `AdminGuard` that checks `process.env.ADMIN_USER_IDS` (comma-separated user IDs). Applied `@UseGuards(JwtAuthGuard, AdminGuard)` to all three endpoints. Admins must be configured via `ADMIN_USER_IDS` env variable. |
| **Verification** | Reviewed `admin.guard.ts` — reads from `process.env.ADMIN_USER_IDS`, splits by comma, trims whitespace, filters empty strings, throws `ForbiddenException` if not admin. Applied to all three endpoints in `shop.controller.ts`. No bypass routes found. `GET /shop/:slugOrId` remains public (intentional) but does not expose pending verifications. Note: `shop.service.ts:207` still includes `email: true` in owner select for admins — acceptable since gated by AdminGuard. |

### ADMIN-002: Category CRUD — no admin guard

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Status** | FIXED |
| **Location** | `server/src/shop/category.controller.ts` |
| **Description** | `POST /shop/categories`, `PUT /shop/categories/:id`, `DELETE /shop/categories/:id` had no admin/role check. |
| **Fix** | Applied `@UseGuards(JwtAuthGuard, AdminGuard)` to all three mutation endpoints. |
| **Verification** | Verified `@UseGuards(JwtAuthGuard, AdminGuard)` on all three mutation endpoints. Public read endpoints (`GET /shop/categories`, `GET /shop/categories/:id`) are intentionally public. No bypass routes found. |

---

## Data Leakage

### LEAK-001: Email exposed in UserTransformer

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | FIXED |
| **Location** | `server/src/common/transformers/user.transformer.ts` |
| **Description** | `UserTransformer.transform()` included `email` in the returned object, exposing user emails to any authenticated caller. |
| **Fix** | Removed `email` from `UserTransformer.transform()`. Email is still available in JWT payload and auth responses where needed. |
| **Verification** | Verified `UserTransformer.transform()` no longer includes email. Global scan found no remaining `email: true` in API responses for user/message/conversation/post/comment/friend/notification endpoints. One remaining `email: true` in `shop.service.ts:207` is gated by `AdminGuard` (admin-only access). No `password`, `refreshToken`, or `refreshTokenHash` found in any API response selects. |

### LEAK-002: Email exposed in message sender data

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | FIXED |
| **Location** | `server/src/messages/messages.service.ts` |
| **Description** | Both `createMessage()` and `getMessages()` included `email: true` in the sender `select`. |
| **Fix** | Removed `email` from sender `select` in both queries. |
| **Verification** | Verified `messages.service.ts` lines 155-163 and 196-205 no longer include `email: true` in sender select. |

---

## WebSocket Authorization

### WS-001: Typing indicators — no conversation membership check

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | FIXED |
| **Location** | `server/src/messages/gateways/messages.gateway.ts` |
| **Description** | `typing` and `stopTyping` events broadcast to `payload.conversationId` without verifying the sender is a member of that conversation. |
| **Fix** | Added `messagesService.checkMember(payload.conversationId, userId)` before broadcasting both events. |
| **Verification** | Verified `messages.gateway.ts` lines 119 and 138 call `checkMember()` with `payload.conversationId` and `userId` (from `client.data.user?.id`, server-side identity). `userId` is never taken from client payload. |

### WS-002: Call signaling events — no room membership verification

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | FIXED |
| **Location** | `server/src/call/call.gateway.ts` |
| **Description** | WebRTC signaling events (`offer`, `answer`, `iceCandidate`, `rejectCall`, `endCall`) did not verify the sender is a participant in the call. |
| **Fix** | Added `isCallParticipant()` helper that parses the roomId format (`call_CALLERID_RECEIVERID_TIMESTAMP`) to extract caller/receiver IDs and verifies the current user is one of them. All signaling events now use this server-side identity check instead of relying on `client.rooms.has()`. `joinCall` was also fixed (previously used a broken `conversationId` lookup that would always fail since roomId ≠ conversationId). |
| **Verification** | Verified `isCallParticipant()` is used on all signaling events (`offer`, `answer`, `iceCandidate`, `rejectCall`, `endCall`) and `joinCall`. `callUser` creates the room with server-generated ID and joins the caller. `acceptCall` verifies `receiverId` matches the current user before joining. `userId` is always from `client.data.user?.id` (server-side JWT identity), never from client payload. `callerId` and `receiverId` in `callUser` are parsed from roomId, not trusted from client input. |

### WS-003: Livestream `streamer-answer` — zero authorization

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | FIXED |
| **Location** | `server/src/livestream/livestream.gateway.ts` |
| **Description** | `livestream:streamer-answer` had no user extraction or authorization. |
| **Fix** | Added `extractUserId` and `livestreamService.getById()` with `streamerId` ownership check. Added auth checks to `handleViewerOffer` and `handleIceCandidate` as well. |
| **Verification** | Verified `handleStreamerAnswer` calls `extractUserId()` then validates via `livestreamService.getById(data.livestreamId)` and checks `streamerId !== userId`. `handleViewerOffer` checks `client.rooms.has(data.livestreamId)` before forwarding. `handleIceCandidate` checks room membership. `extractUserId` now supports both `auth.token` and `Authorization` header. |

### WS-004: Livestream `extractUserId` ignores `Authorization` header

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | FIXED |
| **Location** | `server/src/livestream/livestream.gateway.ts` |
| **Description** | `extractUserId()` only read from `client.handshake.auth.token` and ignored `client.handshake.headers.authorization`. |
| **Fix** | Added `authorization` header parsing in `extractUserId()`, consistent with other gateways. Also added `client.data.user` population and a `Logger` instance. |
| **Verification** | Verified `extractUserId()` at line 51 now reads from both `client.handshake.auth.token` and `client.handshake.headers.authorization` (with Bearer prefix stripping). Also populates `client.data.user` with `id`, `email`, `username`. |

---

## Livestream Public Data Exposure

### LIVESTREAM-001: Public livestream endpoints expose chat history

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | FIXED |
| **Location** | `server/src/livestream/livestream.controller.ts` |
| **Description** | `GET /livestream/:id` and `GET /livestream/:id/messages` required no authentication. |
| **Fix** | Added `@UseGuards(JwtAuthGuard)` to both endpoints. Also switched `POST /livestream` and `POST /livestream/:id/end` from `AuthGuard('jwt')` to `@UseGuards(JwtAuthGuard)` with `@CurrentUser()` for consistency. |
| **Verification** | Verified `GET /livestream/:id` and `GET /livestream/:id/messages` both have `@UseGuards(JwtAuthGuard)`. `GET /livestream/active` remains public (intentional — public listing of active streams). `POST /livestream` and `POST /livestream/:id/end` use `@UseGuards(JwtAuthGuard)` with `@CurrentUser()`. `CreateLivestreamDto` is no longer `import type` (was causing 400 at runtime). |

---

## Friendships

### FRIEND-001: Blocked user can unblock themselves

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Status** | FIXED |
| **Location** | `server/src/friendships/friendships.service.ts:263` |
| **Description** | `unblockFriendship` used an `OR` clause matching BLOCKED records in either direction, allowing the blocked user to unblock themselves. |
| **Fix** | Changed both `findFirst` and `deleteMany` queries to only match `userId: userId, friendId: friendId, status: 'BLOCKED'` — only the original blocker can unblock. |
| **Verification** | Verified: `blockFriendship` creates record as `{ userId: blockerId, friendId: blockedId, status: 'BLOCKED' }`. `unblockFriendship` now only queries `{ userId: callerId, friendId: targetId, status: 'BLOCKED' }`. The blocked user can no longer unblock themselves because their ID would be in `friendId`, not `userId`. |

---

## CSRF Protection

### CSRF-001: No CSRF protection for mutation endpoints

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | FALSE_POSITIVE |
| **Location** | All controllers |
| **Description** | No CSRF middleware is configured. In cookie-based auth, CSRF could allow cross-origin state-changing requests. |
| **Analysis** | After reviewing the authentication architecture: API authentication uses `Authorization: Bearer <accessToken>` header for all mutation endpoints (POST/PUT/PATCH/DELETE). Browsers do not automatically attach `Authorization` headers cross-origin, so CSRF is not exploitable on these endpoints. The only cookie-based flow is `POST /auth/refresh`, which uses `refreshToken` HttpOnly cookie with `sameSite: 'strict'` and path restricted to `/auth/refresh` — preventing cross-origin sending entirely. The existing `sameSite: 'strict'` on the refresh token cookie provides CSRF protection for the refresh flow. `POST /auth/logout` is guarded by `JwtAuthGuard` (Bearer token). Therefore, no additional CSRF middleware is required. |
| **Conclusion** | CSRF is **mitigated by architecture**: API auth uses Authorization header; refresh token cookie has `sameSite: 'strict'`. |

---

## Security Headers

### HDR-001: Missing security headers (no Helmet)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | FIXED |
| **Location** | `server/src/main.ts` |
| **Description** | NestJS application had no security headers middleware — no `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, or other security response headers. |
| **Fix** | Installed `helmet@8.3.0` and configured in `main.ts` with `crossOriginResourcePolicy: { policy: 'cross-origin' }` (required for cross-origin image loading) and conditional `strictTransportSecurity` (enabled only in production). All other Helmet defaults applied. |
| **Verification** | Verified `helmet()` is called before `cookieParser()` in `main.ts`. HSTS is set to `false` for non-production (avoids issues on localhost). `crossOriginResourcePolicy: cross-origin` is set to allow Cloudinary and other CDN resources to be loaded by the frontend. |

---

## File Upload Validation

### UPLOAD-001: Insufficient file upload validation

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | FIXED |
| **Location** | `server/src/cloudinary/cloudinary.service.ts` |
| **Description** | File upload validation relied solely on `file.mimetype` (which can be spoofed) and `file.size` checks. No file extension validation or magic byte content verification was performed. |
| **Fix** | Added three validation layers in `CloudinaryService.validateFile()`: (1) **Extension validation** — checks `file.originalname` extension against `ALLOWED_EXTENSIONS` (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`); (2) **Magic byte validation** — checks the file header bytes against known signatures for each allowed MIME type (JPEG: `FF D8 FF`, PNG: `89 50 4E 47...`, GIF: `47 49 46 38 37/39 61`, WebP: `52 49 46 46`); (3) **Empty file check** — rejects files with 0 size. File count limits are enforced by `FilesInterceptor('images', 10)` at the controller level (max 10 images). All validation happens before any data is sent to Cloudinary. |
| **Validation layers** | (1) MIME type — `file.mimetype` must be in `ALLOWED_MIME_TYPES`; (2) File size — max 10MB; (3) File extension — must match `ALLOWED_EXTENSIONS`; (4) Magic bytes — file header must match expected signature; (5) Empty file rejected. Upload endpoints: avatar (`PATCH /users/me`), post images (`POST /post/create-post`, `PUT /post/update-post/:id`), shop logo/cover (`POST /shop/upload-logo`, `POST /shop/upload-cover`), product images (`POST /shop/products`, `PUT /shop/products/:id`, `PATCH /shop/products/:id`). |
| **Verification** | Verified `validateFile()` is called on every upload (both `uploadImage` and `uploadImages`). Magic byte signatures match each allowed type. Extension check handles case-insensitivity via `.toLowerCase()`. Empty file check catches zero-byte uploads. |

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| RATE-001 | Missing rate limiting | High | FIXED |
| ADMIN-001 | Shop verification — no admin guard | Critical | FIXED |
| ADMIN-002 | Category CRUD — no admin guard | Critical | FIXED |
| LEAK-001 | Email exposed in UserTransformer | High | FIXED |
| LEAK-002 | Email exposed in message sender data | High | FIXED |
| WS-001 | Typing indicators — no membership check | High | FIXED |
| WS-002 | Call signaling — no room membership | High | FIXED |
| WS-003 | Livestream streamer-answer — zero auth | High | FIXED |
| WS-004 | Livestream extractUserId ignores header | Medium | FIXED |
| LIVESTREAM-001 | Public livestream endpoints | Medium | FIXED |
| FRIEND-001 | Blocked user can unblock | Low | FIXED |
| CSRF-001 | No CSRF protection | Medium | FALSE_POSITIVE |
| HDR-001 | Missing security headers | Medium | FIXED |
| UPLOAD-001 | Insufficient file upload validation | Medium | FIXED |
