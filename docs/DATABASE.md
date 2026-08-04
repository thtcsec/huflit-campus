# Database

SQL Server is the system of record. EF Core 9 maps Domain entities via fluent configurations in `Infrastructure/Persistence/Configurations`. Development can bootstrap with `Database.EnsureCreatedAsync()` inside `DbSeeder`; production should use migrations or apply [scripts/schema.sql](../scripts/schema.sql).

## Overview

| Item | Detail |
| --- | --- |
| Engine | SQL Server / Azure SQL / LocalDB |
| Connection | `ConnectionStrings:DefaultConnection` |
| Keys | `uniqueidentifier` (Guid) PKs |
| Soft delete | `IsDeleted bit` on all tables + global EF query filter `!IsDeleted` |
| Audit | `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy` |
| Enums | Stored as `nvarchar` strings |

## Tables

| Table | Entity | Purpose |
| --- | --- | --- |
| `Users` | User | Campus identity (Entra or Email OTP) |
| `RefreshTokens` | RefreshToken | Refresh token rotation |
| `OtpChallenges` | OtpChallenge | Guest OTP challenges (hashed codes) |
| `Events` | Event | EMS events |
| `EventMedia` | EventMedia | Gallery / media |
| `EventSpeakers` | EventSpeaker | Speakers |
| `EventRegistrations` | EventRegistration | Registrations + tickets |
| `AttendanceRecords` | AttendanceRecord | Check-in / check-out |
| `QrTokens` | QrToken | Dynamic QR tokens |
| `SavedEvents` | SavedEvent | User bookmarks |
| `Notifications` | Notification | In-app notifications |
| `Announcements` | Announcement | Campus announcements |
| `Achievements` | Achievement | User achievements (entity exists; no public CRUD API yet) |

Full DDL: [scripts/schema.sql](../scripts/schema.sql).

## Indexes (from EF configurations)

| Table | Index | Notes |
| --- | --- | --- |
| Users | `Email` unique filtered `IsDeleted = 0` | Login lookup |
| Users | `ExternalId` filtered | Entra `oid` |
| Users | `StudentId` filtered | Optional student code |
| RefreshTokens | `Token` unique | |
| RefreshTokens | `UserId` | |
| OtpChallenges | `(Email, CreatedAt)`, `ExpiresAt` | |
| Events | `Slug` unique filtered | SEO / deep links |
| Events | `Status`, `Category`, `StartAt`, `OrganizerId` | Search |
| Events | `(IsFeatured, Status)` | Home feed |
| EventMedia / EventSpeakers | `(EventId, SortOrder)` | |
| EventRegistrations | `(EventId, UserId)` unique filtered | One active registration |
| EventRegistrations | `TicketCode` unique filtered | |
| EventRegistrations | `(EventId, Status)`, `UserId` | |
| AttendanceRecords | `(RegistrationId, Type)`, `EventId`, `UserId` | |
| QrTokens | `Token` unique; `(EventId, Sequence)`; `(EventId, ExpiresAt)` | |
| SavedEvents | `(UserId, EventId)` unique filtered | |
| Notifications | `(UserId, IsRead, CreatedAt)` | Inbox |
| Announcements | `(IsPinned, PublishedAt)`, `ExpiresAt` | |
| Achievements | `UserId` | |

## Soft delete

- All entities implement `ISoftDelete` via `BaseEntity`.
- Deletes set `IsDeleted = true` (and often deactivate users).
- Unique indexes are **filtered** so a soft-deleted email/slug can be reused if business rules allow.
- Queries automatically exclude deleted rows unless `IgnoreQueryFilters()` is used (seeding checks admin by id with filters ignored).

## Seeding (`DbSeeder`)

Runs automatically when `ASPNETCORE_ENVIRONMENT=Development` from `Program.cs`.

1. `EnsureCreatedAsync()`
2. Skip if admin user id already exists
3. Insert:
   - Admin `admin@huflit.edu.vn` (`Administrator`, MicrosoftEntra)
   - Organizer `events@huflit.edu.vn` (`FacultyManager`)
   - Two announcements
   - Three published events (workshop, career fair, sports) with speakers

Fixed Guids (stable for demos):

| Constant | Guid |
| --- | --- |
| AdminUserId | `11111111-1111-1111-1111-111111111111` |
| OrganizerUserId | `22222222-2222-2222-2222-222222222222` |
| WorkshopEventId | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| CareerEventId | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` |
| SportsEventId | `cccccccc-cccc-cccc-cccc-cccccccccccc` |

## Local vs Azure

| Environment | Typical connection |
| --- | --- |
| LocalDB | `Server=(localdb)\\mssqllocaldb;Database=HuflitCampus_Dev;…` |
| Docker Compose | `Server=sqlserver,1433;User Id=sa;Password=…;TrustServerCertificate=True` |
| Azure SQL | `Server=tcp:….database.windows.net,1433;Initial Catalog=HuflitCampus;…` |

Always set `TrustServerCertificate=True` only for local/dev; prefer proper TLS validation in production with Azure SQL.
