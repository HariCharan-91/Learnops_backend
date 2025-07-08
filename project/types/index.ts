// Central type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionData {
  room: {
    roomName: string;
    roomId: string;
    subject: string;
    tutorType: string;
  };
  token: string;
  participant: {
    name: string;
    role: string;
    userId: string;
  };
  session: {
    subject: string;
    tutor: string;
    avatar: string;
  };
  serverUrl: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
  timestamp?: string;
}

export interface Room {
  roomName: string;
  roomId: string;
  serverUrl: string;
  maxParticipants: number;
  subject: string;
  tutorType: string;
  createdAt: string;
}

export interface CreateRoomData {
  roomName?: string;
  maxParticipants?: number;
  subject?: string;
  tutorType?: string;
}

export interface GenerateTokenData {
  roomName: string;
  participantName?: string;
  role?: 'student' | 'tutor';
}

export interface TokenResponse {
  token: string;
  participant: {
    name: string;
    role: string;
    userId: string;
  };
  room: {
    name: string;
    serverUrl: string;
  };
  expiresAt: number;
}