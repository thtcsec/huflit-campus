export enum UserRole {
  Guest = 'Guest',
  Student = 'Student',
  Lecturer = 'Lecturer',
  ClubManager = 'ClubManager',
  FacultyManager = 'FacultyManager',
  Administrator = 'Administrator'
}

export enum EventCategory {
  Academic = 'Academic',
  Workshop = 'Workshop',
  Competition = 'Competition',
  Volunteer = 'Volunteer',
  Seminar = 'Seminar',
  Career = 'Career',
  Sports = 'Sports',
  Arts = 'Arts',
  Entertainment = 'Entertainment',
  ClubActivities = 'ClubActivities'
}

export enum EventStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Published = 'Published',
  Cancelled = 'Cancelled',
  RegistrationClosed = 'RegistrationClosed',
  Completed = 'Completed'
}

export enum RegistrationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Waitlisted = 'Waitlisted',
  Cancelled = 'Cancelled',
  Attended = 'Attended',
  NoShow = 'NoShow'
}

export enum AttendanceType {
  CheckIn = 'CheckIn',
  CheckOut = 'CheckOut'
}

export enum AttendanceStatus {
  OnTime = 'OnTime',
  Late = 'Late',
  EarlyLeave = 'EarlyLeave',
  Valid = 'Valid'
}

export enum NotificationType {
  RegistrationApproved = 'RegistrationApproved',
  RegistrationRejected = 'RegistrationRejected',
  EventReminder = 'EventReminder',
  EventUpdated = 'EventUpdated',
  RegistrationClosed = 'RegistrationClosed',
  NewEvent = 'NewEvent',
  AttendanceConfirmed = 'AttendanceConfirmed'
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: T;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  studentId?: string;
  faculty?: string;
  major?: string;
  phone?: string;
  role: UserRole;
  authProvider: string;
  isActive: boolean;
  hasFcmToken: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserProfile;
}

export interface MicrosoftLoginRequest {
  idToken: string;
  accessToken?: string;
  email: string;
  fullName: string;
  externalId: string;
  avatarUrl?: string;
  studentId?: string;
  faculty?: string;
  major?: string;
}

export interface GuestOtpRequest {
  email: string;
}

export interface GuestOtpVerifyRequest {
  email: string;
  code: string;
  fullName?: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  bannerUrl?: string;
  category: EventCategory;
  status: EventStatus;
  locationName: string;
  faculty?: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  capacity: number;
  registrationCount: number;
  remainingSeats: number;
  isFeatured: boolean;
  viewCount: number;
  saveCount: number;
  organizerId: string;
  organizerName?: string;
  isSaved: boolean;
  isRegistered: boolean;
}

export interface EventMedia {
  id: string;
  url: string;
  mediaType: string;
  sortOrder: number;
  caption?: string;
}

export interface EventSpeaker {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  sortOrder: number;
}

export interface EventDetail extends EventListItem {
  description: string;
  agenda?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  waitlistEnabled: boolean;
  maxWaitlist: number;
  checkInStart?: string;
  checkInEnd?: string;
  requirements?: string;
  sponsor?: string;
  rejectionReason?: string;
  publishedAt?: string;
  createdAt: string;
  media: EventMedia[];
  speakers: EventSpeaker[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  agenda?: string;
  bannerUrl?: string;
  category: EventCategory;
  faculty?: string;
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  capacity: number;
  waitlistEnabled: boolean;
  maxWaitlist: number;
  registrationDeadline: string;
  checkInStart?: string;
  checkInEnd?: string;
  startAt: string;
  endAt: string;
  requirements?: string;
  sponsor?: string;
  isFeatured: boolean;
  speakers?: EventSpeaker[];
  media?: EventMedia[];
}

export interface EventSearchRequest {
  search?: string;
  category?: EventCategory;
  status?: EventStatus;
  faculty?: string;
  from?: string;
  to?: string;
  organizerId?: string;
  featuredOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle?: string;
  eventBannerUrl?: string;
  eventStartAt?: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  status: RegistrationStatus;
  registeredAt: string;
  approvedAt?: string;
  waitlistPosition?: number;
  ticketCode?: string;
  notes?: string;
}

export interface QrPayload {
  eventId: string;
  token: string;
  expiresAt: string;
  sequence: number;
  eventTitle?: string;
}

export interface CheckInRequest {
  eventId: string;
  qrToken: string;
  deviceInfo?: string;
}

export interface Attendance {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle?: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  type: AttendanceType;
  status: AttendanceStatus;
  scannedAt: string;
  isLate: boolean;
  deviceInfo?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  dataJson?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  status: EventStatus;
  startAt: string;
  endAt: string;
  locationName: string;
  bannerUrl?: string;
  isRegistered: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  publishedAt?: string;
  expiresAt?: string;
}

export interface HomeFeed {
  today: EventListItem[];
  trending: EventListItem[];
  upcoming: EventListItem[];
  recent: EventListItem[];
  recommended: EventListItem[];
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface OrganizerStats {
  organizerId: string;
  organizerName: string;
  eventCount: number;
  totalRegistrations: number;
}

export interface PopularEvent {
  eventId: string;
  title: string;
  registrationCount: number;
  viewCount: number;
  saveCount: number;
}

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  publishedEvents: number;
  pendingApprovalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  topCategories: CategoryCount[];
  topOrganizers: OrganizerStats[];
  popularEvents: PopularEvent[];
}

export interface AnalyticsSummary {
  eventsThisMonth: number;
  registrationsThisMonth: number;
  attendanceThisMonth: number;
  averageAttendanceRate: number;
  categoryBreakdown: CategoryCount[];
}
