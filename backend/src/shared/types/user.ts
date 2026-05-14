export type UserRole =
  | 'LEARNER'
  | 'TEACHER'
  | 'MERCHANT'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface IUser {
  id: string;
  email: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITeacherProfile {
  id: string;
  userId: string;
  title?: string;
  specialties: string[];
  experience?: number;
  certifications?: Record<string, unknown>;
  introduction?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserPublic {
  id: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
}
