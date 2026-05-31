// src/core/types/user.types.ts
export type UserRole = 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}
