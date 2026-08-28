# REST API & SignalR

Base URL (local): `http://localhost:5080`

- JSON enums are serialized as **strings**.
- Authenticated routes expect `Authorization: Bearer <access_token>`.
- Failures typically return Problem Details (`400`) with `detail` from `Result.Error`.
- Swagger UI is enabled in Development: `/swagger`.
- Health check: `GET /health` (anonymous).

**Auth legend**

| Tag | Meaning |
| --- | --- |
| Public | `[AllowAnonymous]` |
| Auth | Any authenticated user |
| ManageEvents | Policy `CanManageEvents` (Lecturer, ClubManager, FacultyManager, Administrator) |
| ApproveEvents | Policy `CanApproveEvents` (FacultyManager, Administrator) |
| Analytics | Policy `CanViewAnalytics` (FacultyManager, Administrator) |

---

## Auth — `/api/auth`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/microsoft-login` | Public | `MicrosoftLoginRequest`: `idToken`, optional `accessToken`, `email`, `fullName`, `externalId`, optional profile fields | `200` `AuthResponse` (tokens + `user`) |
| `POST` | `/api/auth/guest/request-otp` | Public | `GuestOtpRequest`: `email` | `204` |
| `POST` | `/api/auth/guest/verify-otp` | Public | `GuestOtpVerifyRequest`: `email`, `code`, optional `fullName` | `200` `AuthResponse` |
| `POST` | `/api/auth/refresh` | Public | `RefreshTokenRequest`: `accessToken`, `refreshToken` | `200` `AuthResponse` |
| `POST` | `/api/auth/logout` | Auth | Optional body `{ "refreshToken": "..." }` | `204` |
| `GET` | `/api/auth/me` | Auth | — | `200` `UserProfileDto` |

`AuthResponse`: `accessToken`, `refreshToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`.

`UserProfileDto`: `id`, `email`, `fullName`, `avatarUrl`, `studentId`, `faculty`, `major`, `phone`, `role`, `authProvider`, `isActive`, `hasFcmToken`, `createdAt`.

---

## Users — `/api/users`

All routes require Auth.

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/users/{id}/profile` | Auth | Path `id` | `200` `UserProfileDto` |
| `PUT` | `/api/users/me/profile` | Auth | `fullName`, `phone?`, `faculty?`, `major?`, `avatarUrl?` | `200` `UserProfileDto` |
| `PUT` | `/api/users/me/fcm-token` | Auth | `{ "fcmToken": "..." }` | `204` |
| `GET` | `/api/users/me/attendance` | Auth | — | `200` `AttendanceDto[]` |
| `GET` | `/api/users/me/achievements` | Auth | — | `200` `AchievementDto[]` |

---

## Events — `/api/events`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/events` | Public | Query `EventSearchRequest`: `search`, `category`, `status`, `faculty`, `from`, `to`, `organizerId`, `featuredOnly`, `page`, `pageSize` | `200` paged `EventListItemDto` |
| `GET` | `/api/events/home` | Public | Query `take` (default 8) | `200` `HomeFeedDto` |
| `GET` | `/api/events/{id}` | Public | — | `200` `EventDetailDto` |
| `GET` | `/api/events/{id}/related` | Public | Query `take` (default 6) | `200` `EventListItemDto[]` |
| `GET` | `/api/events/{id}/feedbacks` | Public | — | `200` `EventFeedbackSummaryDto` |
| `POST` | `/api/events/{id}/feedbacks` | Auth | `CreateEventFeedbackRequest`: `rating`, `comment`, `isAnonymous` | `200` `EventFeedbackDto` |
| `DELETE` | `/api/events/{id}/feedbacks/{feedbackId}` | Auth | — | `204` |
| `POST` | `/api/events` | ManageEvents | `CreateEventRequest` | `201` `EventDetailDto` |
| `PUT` | `/api/events/{id}` | ManageEvents | `UpdateEventRequest` (same shape as create) | `200` `EventDetailDto` |
| `DELETE` | `/api/events/{id}` | ManageEvents | — | `204` (soft delete) |
| `POST` | `/api/events/{id}/submit` | ManageEvents | — | `200` `EventDetailDto` → PendingApproval |
| `POST` | `/api/events/{id}/approve` | ApproveEvents | Optional `{ "note": "..." }` | `200` `EventDetailDto` |
| `POST` | `/api/events/{id}/reject` | ApproveEvents | `RejectEventRequest` (reason required) | `200` `EventDetailDto` |
| `POST` | `/api/events/{id}/publish` | ManageEvents | — | `200` `EventDetailDto` |
| `POST` | `/api/events/{id}/cancel` | ManageEvents | Optional `{ "reason": "..." }` | `200` `EventDetailDto` |
| `POST` | `/api/events/{id}/close-registration` | ManageEvents | — | `200` `EventDetailDto` |
| `POST` | `/api/events/{id}/complete` | ManageEvents | — | `200` `EventDetailDto` |

`CreateEventRequest` includes title, description, agenda, banner, category, faculty, location/address/geo, capacity, waitlist, deadlines, schedule, requirements, sponsor, featured, speakers, media.

---

## Registrations — `/api/registrations`

Base: Auth required. Manager endpoints need ManageEvents.

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/registrations/events/{eventId}` | Auth | Optional `{ "notes": "..." }` | `201` `RegistrationDto` |
| `DELETE` | `/api/registrations/{id}` | Auth | — | `200` `RegistrationDto` (cancel own / allowed) |
| `POST` | `/api/registrations/{id}/approve` | ManageEvents | — | `200` `RegistrationDto` |
| `POST` | `/api/registrations/{id}/reject` | ManageEvents | Optional `{ "notes": "..." }` | `200` `RegistrationDto` |
| `GET` | `/api/registrations/mine` | Auth | Query `page`, `pageSize`, `status?` | `200` paged `RegistrationDto` |
| `GET` | `/api/registrations/events/{eventId}` | ManageEvents | Query `page`, `pageSize`, `status?` | `200` paged `RegistrationDto` |

`RegistrationDto`: registration + event/user summary, `status`, `ticketCode`, `waitlistPosition`, etc.

---

## Attendance — `/api/attendance`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/attendance/events/{eventId}/qr` | ManageEvents | Optional `{ "validitySeconds": 30, "isSingleUse": true }` | `200` `QrPayloadDto` |
| `POST` | `/api/attendance/check-in` | Auth | `eventId`, `qrToken`, `deviceInfo?` | `200` `AttendanceDto` |
| `POST` | `/api/attendance/check-out` | Auth | `eventId`, `qrToken`, `deviceInfo?` | `200` `AttendanceDto` |
| `GET` | `/api/attendance/events/{eventId}` | ManageEvents | — | `200` `AttendanceDto[]` |
| `GET` | `/api/attendance/mine` | Auth | — | `200` `AttendanceDto[]` |

`QrPayloadDto`: `eventId`, `token`, `expiresAt`, `sequence`, `eventTitle?`.

---

## Saved events — `/api/saved-events`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/saved-events/{eventId}` | Auth | — | `204` |
| `DELETE` | `/api/saved-events/{eventId}` | Auth | — | `204` |
| `GET` | `/api/saved-events` | Auth | Query `page`, `pageSize` | `200` paged `EventListItemDto` |

---

## Notifications — `/api/notifications`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/notifications` | Auth | Query `page`, `pageSize`, `unreadOnly` | `200` paged `NotificationDto` |
| `POST` | `/api/notifications/{id}/read` | Auth | — | `204` |
| `POST` | `/api/notifications/read-all` | Auth | — | `204` |

---

## Calendar — `/api/calendar`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/calendar/events` | Auth | Query `from`, `to` (required) | `200` `CalendarEventDto[]` |

---

## Dashboard — `/api/dashboard`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/dashboard/admin` | Analytics | — | `200` `AdminDashboardDto` |

Includes totals (users, events, registrations, attendance), top categories, top organizers, popular events.

---

## Announcements — `/api/announcements`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/announcements` | Public | Query `page`, `pageSize` | `200` paged active `AnnouncementDto` |

There is currently **no** create/update/delete announcement API (seed-only / future admin CRUD).

---

## Files — `/api/files`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/files/upload` | Auth | `multipart/form-data` file + query `folder` = `banner` \| `gallery` (default `gallery`). Max 10 MB. JPEG/PNG/WebP/GIF only | `200` `{ url, fileName, contentType, size, folder }` |

---

## SignalR — `/hubs/notifications`

| Item | Detail |
| --- | --- |
| Hub path | `/hubs/notifications` |
| Auth | JWT required; pass `?access_token=<jwt>` for WebSocket negotiate |
| Groups | On connect, user joins `user:{userId}` |
| Client event | `notificationReceived` |
| Payload | `{ id, userId, type, title, body, dataJson, isRead, createdAt }` |

Vite dev proxy forwards `/hubs` with WebSocket support to the API.

---

## Controllers not present

Do not assume endpoints for: Google OAuth, announcement CRUD, user admin CRUD, achievement APIs, or module routes beyond the tables above. Document only what is implemented in `HuflitCampus.Api/Controllers`.
