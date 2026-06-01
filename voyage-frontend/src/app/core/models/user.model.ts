export type RoleCode = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  role: RoleCode;
  createdAt?: string;
  updatedAt?: string;
}
