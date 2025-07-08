// API configuration constants
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    REFRESH: '/auth/refresh',
  },
  PROFILE: '/profile',
  LIVEKIT: {
    HEALTH: '/livekit/health',
    CREATE_ROOM: '/livekit/create-room',
    GENERATE_TOKEN: '/livekit/generate-token',
    ACTIVE_ROOMS: '/livekit/active-rooms',
    ROOM_INFO: (roomName: string) => `/livekit/room/${roomName}/info`,
    DELETE_ROOM: (roomId: string) => `/livekit/room/${roomId}`,
  },
  HEALTH: '/health',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://5616-106-215-170-8.ngrok-free.app',
  LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://learnops-7m0x0o41.livekit.cloud',
  TIMEOUT: 15000,
} as const;