export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  availability: string[];
  isPublic: boolean;
  avatarUrl?: string;
  ratingAvg: number;
  createdAt: string;
}

export interface Skill {
  id: number;
  userId: number;
  name: string;
  type: 'OFFER' | 'WANT';
}

export interface Swap {
  id: number;
  requesterId: number;
  targetId: number;
  status: 'PENDING' | 'ACTIVE' | 'CANCELED' | 'PAST';
  requestedAt: string;
  acceptedAt?: string;
  requester?: User;
  target?: User;
}

export interface Message {
  id: number;
  swapId: number;
  senderId: number;
  body: string;
  sentAt: string;
  sender?: User;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}