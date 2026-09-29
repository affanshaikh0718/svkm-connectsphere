// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR' | string;
  userType?: 'STUDENT' | 'ALUMNI' | 'FACULTY' | 'RECRUITER' | string;
  institution?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Profile {
  id?: string;
  userId: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  institution?: string;
  college?: string;
  department?: string;
  graduationYear?: number;
  userType?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  connectionCount?: number;
  followerCount?: number;
  followingCount?: number;
  openToWork?: boolean;
  isOpenToWork?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  userId: string;
  company: string;
  companyLogoUrl?: string;
  title: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  userId: string;
  school: string;
  schoolLogoUrl?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  activities?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  endorsementCount: number;
  isEndorsedByCurrentUser: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  doesExpire: boolean;
  credentialId?: string;
  credentialUrl?: string;
  createdAt: string;
}

// ─── Posts & Feed ────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  mediaUrls: string[];
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByCurrentUser: boolean;
  isSavedByCurrentUser: boolean;
  connectionDegree?: 1 | 2 | 3;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  parentCommentId?: string;
  replies?: Comment[];
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  userId: string;
  user: User;
  postId?: string;
  commentId?: string;
  type: 'LIKE' | 'CELEBRATE' | 'SUPPORT' | 'LOVE' | 'INSIGHTFUL' | 'CURIOUS';
  createdAt: string;
}

// ─── Connections ────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | 'NONE'
  | 'PENDING_SENT'
  | 'PENDING_RECEIVED'
  | 'CONNECTED'
  | 'BLOCKED';

export interface Connection {
  id: string;
  requesterId: string;
  requester: User;
  addresseeId: string;
  addressee: User;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  follower: User;
  followingId: string;
  following: User;
  createdAt: string;
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  mediaUrl?: string;
  readBy: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  actor: User;
  type:
    | 'CONNECTION_REQUEST'
    | 'CONNECTION_ACCEPTED'
    | 'POST_LIKE'
    | 'POST_COMMENT'
    | 'COMMENT_REPLY'
    | 'COMMENT_LIKE'
    | 'PROFILE_VIEW'
    | 'ENDORSEMENT'
    | 'JOB_MATCH'
    | 'FOLLOW'
    | 'MENTION';
  resourceId?: string;
  resourceType?: 'POST' | 'COMMENT' | 'JOB' | 'PROFILE' | 'CONNECTION';
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export interface Company {
  id?: string;
  name: string;
  slug: string;
  location?: string;
  growthRate?: string;
  medianTenure?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  foundedYear?: number;
  followerCount?: number;
  isFollowedByCurrentUser?: boolean;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  companyId?: string;
  company: Company;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  location?: string;
  locationType?: string;
  isRemote?: boolean;
  employmentType?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  applicationCount?: number;
  isSavedByCurrentUser?: boolean;
  hasApplied?: boolean;
  isSaved?: boolean;
  isInternship?: boolean;
  matchScore?: number;
  matchedSkillsCount?: number;
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT' | string;
  expiresAt?: string;
  skills?: Array<{ skill: { name: string } }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  applicantId: string;
  applicant: User;
  resumeId?: string;
  resume?: Resume;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  updatedAt: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResults {
  users: User[];
  posts: Post[];
  jobs: Job[];
  companies: Company[];
  totalUsers: number;
  totalPosts: number;
  totalJobs: number;
  totalCompanies: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
  };
}

export interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  emailOrUsername?: string;
  identifier?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
  institution?: string;
  roleType?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  tokens?: AuthTokens;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface TrendingTopic {
  id: string;
  hashtag: string;
  postCount: number;
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
}

export interface ProfileAnalytics {
  profileViewers: number;
  profileViewersTrend?: string;
  postImpressions: number;
  postImpressionsTrend?: string;
  searchAppearances: number;
  searchAppearancesTrend?: string;
  viewerGrowthPercentage?: number;
  connectionCount: number;
  recentViewers?: any[];
  timeSeries?: Array<{ day: string; viewers: number; impressions: number; engagementRate?: string }>;
  demographics?: Array<{ label: string; percentage: number }>;
}

export interface ProfileSummary {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profile: {
    headline: string;
    location: string;
    institution: string;
    profilePictureUrl?: string;
    coverImageUrl?: string;
    connectionCount?: number;
  };
  analytics: {
    profileViewers: number;
    postImpressions: number;
    connectionCount: number;
  };
  savedCount: number;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export type RecommendationStatus =
  | 'REQUESTED'
  | 'PENDING_APPROVAL'
  | 'ACCEPTED'
  | 'DISMISSED'
  | 'REVISION_REQUESTED';

export interface RecommendationUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profile?: {
    headline?: string;
    profilePictureUrl?: string;
  };
}

export interface Recommendation {
  id: string;
  requesterId?: string | null;
  senderId: string;
  recipientId: string;
  positionTitle: string;
  positionId?: string | null;
  relationship: string;
  content?: string | null;
  requestMessage?: string | null;
  revisionNote?: string | null;
  status: RecommendationStatus;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: RecommendationUserSummary;
  recipient?: RecommendationUserSummary;
  requester?: RecommendationUserSummary;
}

export interface UserRecommendationsResponse {
  received: Recommendation[];
  given: Recommendation[];
  pendingApprovals: Recommendation[];
  pendingRequests: Recommendation[];
  isOwner: boolean;
  isConnected: boolean;
  targetPositions: Array<{
    id: string;
    position: string;
    companyName: string;
    isCurrent: boolean;
  }>;
  viewerPositions: Array<{
    id: string;
    position: string;
    companyName: string;
    isCurrent: boolean;
  }>;
  existingBetweenViewerAndTarget?: Recommendation[];
}

export interface RecommendationsInboxResponse {
  incomingRequests: Recommendation[];
  pendingApprovals: Recommendation[];
  revisionsRequested: Recommendation[];
  sentRequests: Recommendation[];
  totalActionable: number;
}

