# Entity-relationship diagram

Domain model for HUFLIT Campus EMS. All entities inherit audit/soft-delete fields from `BaseEntity`:

- `Id` (`uniqueidentifier`)
- `CreatedAt`, `UpdatedAt`
- `CreatedBy`, `UpdatedBy`
- `IsDeleted`

Enums are stored as **strings** in SQL (EF `HasConversion<string>()`).

## Mermaid ERD

```mermaid
erDiagram
  User ||--o{ RefreshToken : has
  User ||--o{ Achievement : earns
  User ||--o{ EventRegistration : registers
  User ||--o{ SavedEvent : saves
  User ||--o{ Notification : receives
  User ||--o{ Announcement : creates
  User ||--o{ Event : organizes
  User ||--o{ Event : approves
  User ||--o{ AttendanceRecord : attends

  Event ||--o{ EventMedia : has
  Event ||--o{ EventSpeaker : has
  Event ||--o{ EventRegistration : has
  Event ||--o{ QrToken : issues
  Event ||--o{ SavedEvent : saved_as
  Event ||--o{ AttendanceRecord : records

  EventRegistration ||--o{ AttendanceRecord : produces
  QrToken ||--o| AttendanceRecord : scanned_with

  OtpChallenge }o--|| User : "email lookup (no FK)"

  User {
    uniqueidentifier Id PK
    nvarchar Email UK
    nvarchar FullName
    nvarchar AvatarUrl
    nvarchar StudentId
    nvarchar Faculty
    nvarchar Major
    nvarchar Role
    nvarchar AuthProvider
    nvarchar ExternalId
    nvarchar Phone
    bit IsActive
    nvarchar FcmToken
  }

  RefreshToken {
    uniqueidentifier Id PK
    uniqueidentifier UserId FK
    nvarchar Token UK
    datetime2 ExpiresAt
    datetime2 RevokedAt
    nvarchar ReplacedByToken
  }

  OtpChallenge {
    uniqueidentifier Id PK
    nvarchar Email
    nvarchar CodeHash
    datetime2 ExpiresAt
    int Attempts
    bit IsConsumed
  }

  Event {
    uniqueidentifier Id PK
    nvarchar Title
    nvarchar Slug UK
    nvarchar Description
    nvarchar Agenda
    nvarchar BannerUrl
    nvarchar Category
    nvarchar Status
    uniqueidentifier OrganizerId FK
    nvarchar Faculty
    nvarchar LocationName
    nvarchar Address
    float Latitude
    float Longitude
    nvarchar GoogleMapsUrl
    int Capacity
    bit WaitlistEnabled
    int MaxWaitlist
    datetime2 RegistrationDeadline
    datetime2 CheckInStart
    datetime2 CheckInEnd
    datetime2 StartAt
    datetime2 EndAt
    nvarchar Requirements
    nvarchar Sponsor
    bit IsFeatured
    int ViewCount
    int SaveCount
    int RegistrationCount
    uniqueidentifier ApprovedById FK
    datetime2 ApprovedAt
    nvarchar RejectionReason
    datetime2 PublishedAt
    datetime2 CancelledAt
  }

  EventMedia {
    uniqueidentifier Id PK
    uniqueidentifier EventId FK
    nvarchar Url
    nvarchar MediaType
    int SortOrder
    nvarchar Caption
  }

  EventSpeaker {
    uniqueidentifier Id PK
    uniqueidentifier EventId FK
    nvarchar Name
    nvarchar Title
    nvarchar Bio
    nvarchar AvatarUrl
    int SortOrder
  }

  EventRegistration {
    uniqueidentifier Id PK
    uniqueidentifier EventId FK
    uniqueidentifier UserId FK
    nvarchar Status
    datetime2 RegisteredAt
    datetime2 ApprovedAt
    int WaitlistPosition
    nvarchar TicketCode UK
    nvarchar Notes
  }

  AttendanceRecord {
    uniqueidentifier Id PK
    uniqueidentifier RegistrationId FK
    uniqueidentifier EventId FK
    uniqueidentifier UserId FK
    nvarchar Type
    nvarchar Status
    datetime2 ScannedAt
    uniqueidentifier QrTokenId FK
    nvarchar DeviceInfo
    bit IsLate
  }

  QrToken {
    uniqueidentifier Id PK
    uniqueidentifier EventId FK
    nvarchar Token UK
    datetime2 ExpiresAt
    datetime2 IssuedAt
    bit IsSingleUse
    datetime2 UsedAt
    int Sequence
  }

  SavedEvent {
    uniqueidentifier Id PK
    uniqueidentifier UserId FK
    uniqueidentifier EventId FK
    datetime2 SavedAt
  }

  Notification {
    uniqueidentifier Id PK
    uniqueidentifier UserId FK
    nvarchar Type
    nvarchar Title
    nvarchar Body
    nvarchar DataJson
    bit IsRead
    datetime2 ReadAt
  }

  Announcement {
    uniqueidentifier Id PK
    nvarchar Title
    nvarchar Body
    bit IsPinned
    datetime2 PublishedAt
    datetime2 ExpiresAt
    uniqueidentifier CreatedById FK
  }

  Achievement {
    uniqueidentifier Id PK
    uniqueidentifier UserId FK
    nvarchar Title
    nvarchar Description
    nvarchar IconUrl
    datetime2 EarnedAt
  }
```

## Relationship summary

| From | To | Cardinality | Notes |
| --- | --- | --- | --- |
| User | RefreshToken | 1:N | Cascade delete |
| User | Achievement | 1:N | Cascade delete |
| User | Notification | 1:N | Cascade delete |
| User | SavedEvent | 1:N | Cascade delete |
| User | EventRegistration | 1:N | Restrict delete |
| User | Event (Organizer) | 1:N | Restrict |
| User | Event (ApprovedBy) | 1:N optional | Restrict |
| User | Announcement | 1:N | Restrict (`CreatedById`) |
| Event | EventMedia / EventSpeaker | 1:N | Cascade |
| Event | EventRegistration / QrToken / SavedEvent | 1:N | Cascade |
| EventRegistration | AttendanceRecord | 1:N | Cascade |
| AttendanceRecord | QrToken | N:0..1 | SetNull on QR delete |
| OtpChallenge | — | — | Keyed by email; no FK to User |

## Enum values (reference)

| Enum | Values |
| --- | --- |
| `UserRole` | Guest, Student, Lecturer, ClubManager, FacultyManager, Administrator |
| `AuthProvider` | MicrosoftEntra, EmailOtp |
| `EventCategory` | Academic, Workshop, Competition, Volunteer, Seminar, Career, Sports, Arts, Entertainment, ClubActivities |
| `EventStatus` | Draft, PendingApproval, Approved, Rejected, Published, Cancelled, RegistrationClosed, Completed |
| `RegistrationStatus` | Pending, Approved, Rejected, Waitlisted, Cancelled, Attended, NoShow |
| `AttendanceType` | CheckIn, CheckOut |
| `AttendanceStatus` | OnTime, Late, EarlyLeave, Valid |
| `NotificationType` | RegistrationApproved, RegistrationRejected, EventReminder, EventUpdated, RegistrationClosed, NewEvent, AttendanceConfirmed |
| `MediaType` | Image, Video |

## Unique constraints (logical)

- `Users.Email` unique where not deleted
- `Events.Slug` unique where not deleted
- `EventRegistrations (EventId, UserId)` unique where not deleted
- `SavedEvents (UserId, EventId)` unique where not deleted
- `RefreshTokens.Token`, `QrTokens.Token`, `EventRegistrations.TicketCode` unique

See [DATABASE.md](DATABASE.md) and [scripts/schema.sql](../scripts/schema.sql) for physical indexes.
