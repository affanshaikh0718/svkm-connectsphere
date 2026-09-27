// Common shared types between NestJS API and Next.js Frontend

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  UNVERIFIED = 'UNVERIFIED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED'
}

export enum FollowTargetType {
  USER = 'USER',
  COMPANY = 'COMPANY'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
  VOLUNTEER = 'VOLUNTEER'
}

export enum LocationType {
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE'
}

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LINK = 'LINK',
  POLL = 'POLL',
  SHARE = 'SHARE'
}

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  CONNECTIONS = 'CONNECTIONS',
  PRIVATE = 'PRIVATE'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export enum NotificationType {
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
  POST_LIKED = 'POST_LIKED',
  POST_COMMENTED = 'POST_COMMENTED',
  COMMENT_REPLIED = 'COMMENT_REPLIED',
  POST_SHARED = 'POST_SHARED',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  JOB_APPLICATION_UPDATE = 'JOB_APPLICATION_UPDATE',
  JOB_RECOMMENDATION = 'JOB_RECOMMENDATION',
  COMPANY_POST = 'COMPANY_POST',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM'
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED'
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  headline?: string;
  profilePictureUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  pagination?: {
    nextCursor?: string | null;
    hasMore: boolean;
    total?: number;
  };
}
