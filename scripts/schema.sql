/*
  HUFLIT Campus — SQL Server schema
  Mirrors Domain entities + EF Core fluent configurations.
  Guids: uniqueidentifier | Soft delete + audit on all tables
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.AttendanceRecords', N'U') IS NOT NULL DROP TABLE dbo.AttendanceRecords;
IF OBJECT_ID(N'dbo.QrTokens', N'U') IS NOT NULL DROP TABLE dbo.QrTokens;
IF OBJECT_ID(N'dbo.EventRegistrations', N'U') IS NOT NULL DROP TABLE dbo.EventRegistrations;
IF OBJECT_ID(N'dbo.SavedEvents', N'U') IS NOT NULL DROP TABLE dbo.SavedEvents;
IF OBJECT_ID(N'dbo.EventMedia', N'U') IS NOT NULL DROP TABLE dbo.EventMedia;
IF OBJECT_ID(N'dbo.EventSpeakers', N'U') IS NOT NULL DROP TABLE dbo.EventSpeakers;
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID(N'dbo.Achievements', N'U') IS NOT NULL DROP TABLE dbo.Achievements;
IF OBJECT_ID(N'dbo.Announcements', N'U') IS NOT NULL DROP TABLE dbo.Announcements;
IF OBJECT_ID(N'dbo.Events', N'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID(N'dbo.RefreshTokens', N'U') IS NOT NULL DROP TABLE dbo.RefreshTokens;
IF OBJECT_ID(N'dbo.OtpChallenges', N'U') IS NOT NULL DROP TABLE dbo.OtpChallenges;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id              uniqueidentifier NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    Email           nvarchar(256)    NOT NULL,
    FullName        nvarchar(200)    NOT NULL,
    AvatarUrl       nvarchar(1000)   NULL,
    StudentId       nvarchar(50)     NULL,
    Faculty         nvarchar(200)    NULL,
    Major           nvarchar(200)    NULL,
    Role            nvarchar(50)     NOT NULL,
    AuthProvider    nvarchar(50)     NOT NULL,
    ExternalId      nvarchar(128)    NULL,
    Phone           nvarchar(30)     NULL,
    IsActive        bit              NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    FcmToken        nvarchar(512)    NULL,
    CreatedAt       datetime2        NOT NULL,
    UpdatedAt       datetime2        NULL,
    CreatedBy       nvarchar(64)     NULL,
    UpdatedBy       nvarchar(64)     NULL,
    IsDeleted       bit              NOT NULL CONSTRAINT DF_Users_IsDeleted DEFAULT (0)
);
GO

CREATE UNIQUE INDEX IX_Users_Email
    ON dbo.Users (Email)
    WHERE IsDeleted = 0;

CREATE INDEX IX_Users_ExternalId
    ON dbo.Users (ExternalId)
    WHERE ExternalId IS NOT NULL AND IsDeleted = 0;

CREATE INDEX IX_Users_StudentId
    ON dbo.Users (StudentId)
    WHERE StudentId IS NOT NULL AND IsDeleted = 0;
GO

CREATE TABLE dbo.RefreshTokens (
    Id               uniqueidentifier NOT NULL CONSTRAINT PK_RefreshTokens PRIMARY KEY,
    Token            nvarchar(512)    NOT NULL,
    UserId           uniqueidentifier NOT NULL,
    ExpiresAt        datetime2        NOT NULL,
    RevokedAt        datetime2        NULL,
    ReplacedByToken  nvarchar(512)    NULL,
    CreatedAt        datetime2        NOT NULL,
    UpdatedAt        datetime2        NULL,
    CreatedBy        nvarchar(64)     NULL,
    UpdatedBy        nvarchar(64)     NULL,
    IsDeleted        bit              NOT NULL CONSTRAINT DF_RefreshTokens_IsDeleted DEFAULT (0),
    CONSTRAINT FK_RefreshTokens_Users_UserId
        FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX IX_RefreshTokens_Token ON dbo.RefreshTokens (Token);
CREATE INDEX IX_RefreshTokens_UserId ON dbo.RefreshTokens (UserId);
GO

CREATE TABLE dbo.OtpChallenges (
    Id          uniqueidentifier NOT NULL CONSTRAINT PK_OtpChallenges PRIMARY KEY,
    Email       nvarchar(256)    NOT NULL,
    CodeHash    nvarchar(128)    NOT NULL,
    ExpiresAt   datetime2        NOT NULL,
    Attempts    int              NOT NULL CONSTRAINT DF_OtpChallenges_Attempts DEFAULT (0),
    IsConsumed  bit              NOT NULL CONSTRAINT DF_OtpChallenges_IsConsumed DEFAULT (0),
    CreatedAt   datetime2        NOT NULL,
    UpdatedAt   datetime2        NULL,
    CreatedBy   nvarchar(64)     NULL,
    UpdatedBy   nvarchar(64)     NULL,
    IsDeleted   bit              NOT NULL CONSTRAINT DF_OtpChallenges_IsDeleted DEFAULT (0)
);
GO

CREATE INDEX IX_OtpChallenges_Email_CreatedAt ON dbo.OtpChallenges (Email, CreatedAt);
CREATE INDEX IX_OtpChallenges_ExpiresAt ON dbo.OtpChallenges (ExpiresAt);
GO

CREATE TABLE dbo.Events (
    Id                    uniqueidentifier NOT NULL CONSTRAINT PK_Events PRIMARY KEY,
    Title                 nvarchar(300)    NOT NULL,
    Slug                  nvarchar(350)    NOT NULL,
    Description           nvarchar(max)    NOT NULL, -- EF HasMaxLength(8000) → nvarchar(max)
    Agenda                nvarchar(max)    NULL,     -- EF HasMaxLength(8000) → nvarchar(max)
    BannerUrl             nvarchar(1000)   NULL,
    Category              nvarchar(50)     NOT NULL,
    Status                nvarchar(50)     NOT NULL,
    OrganizerId           uniqueidentifier NOT NULL,
    Faculty               nvarchar(200)    NULL,
    LocationName          nvarchar(300)    NOT NULL,
    Address               nvarchar(500)    NULL,
    Latitude              float            NULL,
    Longitude             float            NULL,
    GoogleMapsUrl         nvarchar(1000)   NULL,
    Capacity              int              NOT NULL,
    WaitlistEnabled       bit              NOT NULL CONSTRAINT DF_Events_WaitlistEnabled DEFAULT (0),
    MaxWaitlist           int              NOT NULL CONSTRAINT DF_Events_MaxWaitlist DEFAULT (0),
    RegistrationDeadline  datetime2        NOT NULL,
    CheckInStart          datetime2        NULL,
    CheckInEnd            datetime2        NULL,
    StartAt               datetime2        NOT NULL,
    EndAt                 datetime2        NOT NULL,
    Requirements          nvarchar(2000)   NULL,
    Sponsor               nvarchar(300)    NULL,
    IsFeatured            bit              NOT NULL CONSTRAINT DF_Events_IsFeatured DEFAULT (0),
    ViewCount             int              NOT NULL CONSTRAINT DF_Events_ViewCount DEFAULT (0),
    SaveCount             int              NOT NULL CONSTRAINT DF_Events_SaveCount DEFAULT (0),
    RegistrationCount     int              NOT NULL CONSTRAINT DF_Events_RegistrationCount DEFAULT (0),
    ApprovedById          uniqueidentifier NULL,
    ApprovedAt            datetime2        NULL,
    RejectionReason       nvarchar(1000)   NULL,
    PublishedAt           datetime2        NULL,
    CancelledAt           datetime2        NULL,
    CreatedAt             datetime2        NOT NULL,
    UpdatedAt             datetime2        NULL,
    CreatedBy             nvarchar(64)     NULL,
    UpdatedBy             nvarchar(64)     NULL,
    IsDeleted             bit              NOT NULL CONSTRAINT DF_Events_IsDeleted DEFAULT (0),
    CONSTRAINT FK_Events_Users_OrganizerId
        FOREIGN KEY (OrganizerId) REFERENCES dbo.Users (Id),
    CONSTRAINT FK_Events_Users_ApprovedById
        FOREIGN KEY (ApprovedById) REFERENCES dbo.Users (Id)
);
GO

CREATE UNIQUE INDEX IX_Events_Slug
    ON dbo.Events (Slug)
    WHERE IsDeleted = 0;

CREATE INDEX IX_Events_Status ON dbo.Events (Status);
CREATE INDEX IX_Events_Category ON dbo.Events (Category);
CREATE INDEX IX_Events_StartAt ON dbo.Events (StartAt);
CREATE INDEX IX_Events_OrganizerId ON dbo.Events (OrganizerId);
CREATE INDEX IX_Events_IsFeatured_Status ON dbo.Events (IsFeatured, Status);
GO

CREATE TABLE dbo.EventMedia (
    Id          uniqueidentifier NOT NULL CONSTRAINT PK_EventMedia PRIMARY KEY,
    EventId     uniqueidentifier NOT NULL,
    Url         nvarchar(1000)   NOT NULL,
    MediaType   nvarchar(50)     NOT NULL,
    SortOrder   int              NOT NULL CONSTRAINT DF_EventMedia_SortOrder DEFAULT (0),
    Caption     nvarchar(500)    NULL,
    CreatedAt   datetime2        NOT NULL,
    UpdatedAt   datetime2        NULL,
    CreatedBy   nvarchar(64)     NULL,
    UpdatedBy   nvarchar(64)     NULL,
    IsDeleted   bit              NOT NULL CONSTRAINT DF_EventMedia_IsDeleted DEFAULT (0),
    CONSTRAINT FK_EventMedia_Events_EventId
        FOREIGN KEY (EventId) REFERENCES dbo.Events (Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_EventMedia_EventId_SortOrder ON dbo.EventMedia (EventId, SortOrder);
GO

CREATE TABLE dbo.EventSpeakers (
    Id          uniqueidentifier NOT NULL CONSTRAINT PK_EventSpeakers PRIMARY KEY,
    EventId     uniqueidentifier NOT NULL,
    Name        nvarchar(200)    NOT NULL,
    Title       nvarchar(200)    NULL,
    Bio         nvarchar(2000)   NULL,
    AvatarUrl   nvarchar(1000)   NULL,
    SortOrder   int              NOT NULL CONSTRAINT DF_EventSpeakers_SortOrder DEFAULT (0),
    CreatedAt   datetime2        NOT NULL,
    UpdatedAt   datetime2        NULL,
    CreatedBy   nvarchar(64)     NULL,
    UpdatedBy   nvarchar(64)     NULL,
    IsDeleted   bit              NOT NULL CONSTRAINT DF_EventSpeakers_IsDeleted DEFAULT (0),
    CONSTRAINT FK_EventSpeakers_Events_EventId
        FOREIGN KEY (EventId) REFERENCES dbo.Events (Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_EventSpeakers_EventId_SortOrder ON dbo.EventSpeakers (EventId, SortOrder);
GO

CREATE TABLE dbo.EventRegistrations (
    Id                uniqueidentifier NOT NULL CONSTRAINT PK_EventRegistrations PRIMARY KEY,
    EventId           uniqueidentifier NOT NULL,
    UserId            uniqueidentifier NOT NULL,
    Status            nvarchar(50)     NOT NULL,
    RegisteredAt      datetime2        NOT NULL,
    ApprovedAt        datetime2        NULL,
    WaitlistPosition  int              NULL,
    TicketCode        nvarchar(50)     NULL,
    Notes             nvarchar(1000)   NULL,
    CreatedAt         datetime2        NOT NULL,
    UpdatedAt         datetime2        NULL,
    CreatedBy         nvarchar(64)     NULL,
    UpdatedBy         nvarchar(64)     NULL,
    IsDeleted         bit              NOT NULL CONSTRAINT DF_EventRegistrations_IsDeleted DEFAULT (0),
    CONSTRAINT FK_EventRegistrations_Events_EventId
        FOREIGN KEY (EventId) REFERENCES dbo.Events (Id) ON DELETE CASCADE,
    CONSTRAINT FK_EventRegistrations_Users_UserId
        FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
);
GO

CREATE UNIQUE INDEX IX_EventRegistrations_EventId_UserId
    ON dbo.EventRegistrations (EventId, UserId)
    WHERE IsDeleted = 0;

CREATE UNIQUE INDEX IX_EventRegistrations_TicketCode
    ON dbo.EventRegistrations (TicketCode)
    WHERE TicketCode IS NOT NULL AND IsDeleted = 0;

CREATE INDEX IX_EventRegistrations_EventId_Status ON dbo.EventRegistrations (EventId, Status);
CREATE INDEX IX_EventRegistrations_UserId ON dbo.EventRegistrations (UserId);
GO

CREATE TABLE dbo.QrTokens (
    Id           uniqueidentifier NOT NULL CONSTRAINT PK_QrTokens PRIMARY KEY,
    EventId      uniqueidentifier NOT NULL,
    Token        nvarchar(128)    NOT NULL,
    ExpiresAt    datetime2        NOT NULL,
    IssuedAt     datetime2        NOT NULL,
    IsSingleUse  bit              NOT NULL CONSTRAINT DF_QrTokens_IsSingleUse DEFAULT (1),
    UsedAt       datetime2        NULL,
    Sequence     int              NOT NULL CONSTRAINT DF_QrTokens_Sequence DEFAULT (0),
    CreatedAt    datetime2        NOT NULL,
    UpdatedAt    datetime2        NULL,
    CreatedBy    nvarchar(64)     NULL,
    UpdatedBy    nvarchar(64)     NULL,
    IsDeleted    bit              NOT NULL CONSTRAINT DF_QrTokens_IsDeleted DEFAULT (0),
    CONSTRAINT FK_QrTokens_Events_EventId
        FOREIGN KEY (EventId) REFERENCES dbo.Events (Id) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX IX_QrTokens_Token ON dbo.QrTokens (Token);
CREATE INDEX IX_QrTokens_EventId_Sequence ON dbo.QrTokens (EventId, Sequence);
CREATE INDEX IX_QrTokens_EventId_ExpiresAt ON dbo.QrTokens (EventId, ExpiresAt);
GO

CREATE TABLE dbo.AttendanceRecords (
    Id              uniqueidentifier NOT NULL CONSTRAINT PK_AttendanceRecords PRIMARY KEY,
    RegistrationId  uniqueidentifier NOT NULL,
    EventId         uniqueidentifier NOT NULL,
    UserId          uniqueidentifier NOT NULL,
    Type            nvarchar(50)     NOT NULL,
    Status          nvarchar(50)     NOT NULL,
    ScannedAt       datetime2        NOT NULL,
    QrTokenId       uniqueidentifier NULL,
    DeviceInfo      nvarchar(500)    NULL,
    IsLate          bit              NOT NULL CONSTRAINT DF_AttendanceRecords_IsLate DEFAULT (0),
    CreatedAt       datetime2        NOT NULL,
    UpdatedAt       datetime2        NULL,
    CreatedBy       nvarchar(64)     NULL,
    UpdatedBy       nvarchar(64)     NULL,
    IsDeleted       bit              NOT NULL CONSTRAINT DF_AttendanceRecords_IsDeleted DEFAULT (0),
    -- NO ACTION avoids SQL Server multiple cascade path errors.
    CONSTRAINT FK_AttendanceRecords_EventRegistrations_RegistrationId
        FOREIGN KEY (RegistrationId) REFERENCES dbo.EventRegistrations (Id) ON DELETE NO ACTION,
    CONSTRAINT FK_AttendanceRecords_Events_EventId
        FOREIGN KEY (EventId) REFERENCES dbo.Events (Id) ON DELETE NO ACTION,
    CONSTRAINT FK_AttendanceRecords_Users_UserId
        FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE NO ACTION,
    CONSTRAINT FK_AttendanceRecords_QrTokens_QrTokenId
        FOREIGN KEY (QrTokenId) REFERENCES dbo.QrTokens (Id) ON DELETE NO ACTION
);
GO

CREATE INDEX IX_AttendanceRecords_RegistrationId_Type ON dbo.AttendanceRecords (RegistrationId, Type);
CREATE INDEX IX_AttendanceRecords_EventId ON dbo.AttendanceRecords (EventId);
CREATE INDEX IX_AttendanceRecords_UserId ON dbo.AttendanceRecords (UserId);
GO

CREATE TABLE dbo.SavedEvents (
    Id          uniqueidentifier NOT NULL CONSTRAINT PK_SavedEvents PRIMARY KEY,
    UserId      uniqueidentifier NOT NULL,
    EventId     uniqueidentifier NOT NULL,
    SavedAt     datetime2        NOT NULL,
    CreatedAt   datetime2        NOT NULL,
    UpdatedAt   datetime2        NULL,
    CreatedBy   nvarchar(64)     NULL,
    UpdatedBy   nvarchar(64)     NULL,
    IsDeleted   bit              NOT NULL CONSTRAINT DF_SavedEvents_IsDeleted DEFAULT (0),
    CONSTRAINT FK_SavedEvents_Users_UserId
        FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE,
    CONSTRAINT FK_SavedEvents_Events_EventId
        FOREIGN KEY (EventId) REFERENCES dbo.Events (Id) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX IX_SavedEvents_UserId_EventId
    ON dbo.SavedEvents (UserId, EventId)
    WHERE IsDeleted = 0;

CREATE INDEX IX_SavedEvents_UserId ON dbo.SavedEvents (UserId);
GO

CREATE TABLE dbo.Notifications (
    Id          uniqueidentifier NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
    UserId      uniqueidentifier NOT NULL,
    Type        nvarchar(50)     NOT NULL,
    Title       nvarchar(300)    NOT NULL,
    Body        nvarchar(2000)   NOT NULL,
    DataJson    nvarchar(4000)   NULL,
    IsRead      bit              NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
    ReadAt      datetime2        NULL,
    CreatedAt   datetime2        NOT NULL,
    UpdatedAt   datetime2        NULL,
    CreatedBy   nvarchar(64)     NULL,
    UpdatedBy   nvarchar(64)     NULL,
    IsDeleted   bit              NOT NULL CONSTRAINT DF_Notifications_IsDeleted DEFAULT (0),
    CONSTRAINT FK_Notifications_Users_UserId
        FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Notifications_UserId_IsRead_CreatedAt
    ON dbo.Notifications (UserId, IsRead, CreatedAt);
GO

CREATE TABLE dbo.Announcements (
    Id            uniqueidentifier NOT NULL CONSTRAINT PK_Announcements PRIMARY KEY,
    Title         nvarchar(300)    NOT NULL,
    Body          nvarchar(4000)   NOT NULL,
    IsPinned      bit              NOT NULL CONSTRAINT DF_Announcements_IsPinned DEFAULT (0),
    PublishedAt   datetime2        NULL,
    ExpiresAt     datetime2        NULL,
    CreatedById   uniqueidentifier NOT NULL,
    CreatedAt     datetime2        NOT NULL,
    UpdatedAt     datetime2        NULL,
    CreatedBy     nvarchar(64)     NULL,
    UpdatedBy     nvarchar(64)     NULL,
    IsDeleted     bit              NOT NULL CONSTRAINT DF_Announcements_IsDeleted DEFAULT (0),
    CONSTRAINT FK_Announcements_Users_CreatedById
        FOREIGN KEY (CreatedById) REFERENCES dbo.Users (Id)
);
GO

CREATE INDEX IX_Announcements_IsPinned_PublishedAt ON dbo.Announcements (IsPinned, PublishedAt);
CREATE INDEX IX_Announcements_ExpiresAt ON dbo.Announcements (ExpiresAt);
GO

CREATE TABLE dbo.Achievements (
    Id           uniqueidentifier NOT NULL CONSTRAINT PK_Achievements PRIMARY KEY,
    UserId       uniqueidentifier NOT NULL,
    Title        nvarchar(200)    NOT NULL,
    Description  nvarchar(1000)   NOT NULL,
    IconUrl      nvarchar(1000)   NULL,
    EarnedAt     datetime2        NOT NULL,
    CreatedAt    datetime2        NOT NULL,
    UpdatedAt    datetime2        NULL,
    CreatedBy    nvarchar(64)     NULL,
    UpdatedBy    nvarchar(64)     NULL,
    IsDeleted    bit              NOT NULL CONSTRAINT DF_Achievements_IsDeleted DEFAULT (0),
    CONSTRAINT FK_Achievements_Users_UserId
        FOREIGN KEY (UserId) REFERENCES dbo.Users (Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Achievements_UserId ON dbo.Achievements (UserId);
GO
