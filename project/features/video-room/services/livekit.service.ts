import { apiService } from '@/services/api.service';
import { API_ENDPOINTS, API_CONFIG } from '@/constants/api';
import { Room, CreateRoomData, GenerateTokenData, TokenResponse } from '@/types';

export class LiveKitService {
  async createRoom(data: CreateRoomData): Promise<Room> {
    console.log('🎥 Creating LiveKit room with data:', data);
    
    const response = await apiService.post<any>(API_ENDPOINTS.LIVEKIT.CREATE_ROOM, {
      ...data,
      serverUrl: API_CONFIG.LIVEKIT_URL
    });

    if (response.success && response.room) {
      console.log('✅ Room created successfully:', response.room);
      
      return {
        ...response.room,
        serverUrl: API_CONFIG.LIVEKIT_URL
      };
    } else {
      throw new Error(response.error || 'Failed to create room - invalid response');
    }
  }

  async generateToken(data: GenerateTokenData): Promise<TokenResponse> {
    console.log('🔑 Generating access token for:', data);
    
    const response = await apiService.post<any>(API_ENDPOINTS.LIVEKIT.GENERATE_TOKEN, data);

    if (response.success && response.token) {
      console.log('✅ Token generated successfully');
      
      return {
        ...response,
        room: {
          ...response.room,
          serverUrl: API_CONFIG.LIVEKIT_URL
        }
      };
    } else {
      throw new Error(response.error || 'Failed to generate token - invalid response');
    }
  }

  async getActiveRooms(): Promise<any[]> {
    console.log('📋 Fetching active rooms...');
    const response = await apiService.get<any>(API_ENDPOINTS.LIVEKIT.ACTIVE_ROOMS);

    if (response.success) {
      console.log('✅ Active rooms fetched:', response.rooms?.length || 0, 'rooms');
      return response.rooms || [];
    } else {
      throw new Error(response.error || 'Failed to fetch active rooms');
    }
  }

  async deleteRoom(roomId: string): Promise<any> {
    console.log('🗑️ Deleting room:', roomId);
    const response = await apiService.delete<any>(API_ENDPOINTS.LIVEKIT.DELETE_ROOM(roomId));

    if (response.success) {
      console.log('✅ Room deleted successfully');
      return response;
    } else {
      throw new Error(response.error || 'Failed to delete room');
    }
  }

  async getRoomInfo(roomName: string): Promise<any> {
    console.log('ℹ️ Fetching room info for:', roomName);
    const response = await apiService.get<any>(API_ENDPOINTS.LIVEKIT.ROOM_INFO(roomName));

    if (response.success && response.room) {
      console.log('✅ Room info fetched:', response.room);
      return response.room;
    } else {
      throw new Error(response.error || 'Room not found');
    }
  }

  async checkHealth(): Promise<any> {
    console.log('🏥 Checking LiveKit health...');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LIVEKIT.HEALTH}`, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ LiveKit health check successful:', data);
    return data;
  }
}

export const livekitService = new LiveKitService();