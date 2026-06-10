export type RoleCode = 'USER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  status: UserStatus;
  emailVerified: boolean;
  role: RoleCode;
  createdAt?: string;
  updatedAt?: string;
}

export type UserMeResponse = UserResponse;

export interface UserProfileUpdateRequest {
  fullName: string;
  phone?: string;
}

export interface AvatarUploadResponse {
  avatarUrl?: string;
  avatarPublicId?: string;
  user?: UserResponse;
}
