'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { livekitService } from '@/features/video-room/services/livekit.service';
import { Room, CreateRoomData, GenerateTokenData, TokenResponse } from '@/types';

export function useLiveKit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const createRoom = useCallback(async (data: CreateRoomData): Promise<Room> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required. Please login first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const room = await livekitService.createRoom(data);
      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      console.error('❌ Room creation failed:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const generateToken = useCallback(async (data: GenerateTokenData): Promise<TokenResponse> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required. Please login first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenResponse = await livekitService.generateToken(data);
      return tokenResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate token';
      console.error('❌ Token generation failed:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getActiveRooms = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required. Please login first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const rooms = await livekitService.getActiveRooms();
      return rooms;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active rooms';
      console.error('❌ Failed to fetch active rooms:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const deleteRoom = useCallback(async (roomId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required. Please login first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await livekitService.deleteRoom(roomId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room';
      console.error('❌ Room deletion failed:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getRoomInfo = useCallback(async (roomName: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required. Please login first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const room = await livekitService.getRoomInfo(roomName);
      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch room info';
      console.error('❌ Failed to fetch room info:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const checkHealth = useCallback(async () => {
    try {
      const data = await livekitService.checkHealth();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      console.error('❌ LiveKit health check failed:', errorMessage);
      throw new Error(`LiveKit service unavailable: ${errorMessage}`);
    }
  }, []);

  return {
    createRoom,
    generateToken,
    getActiveRooms,
    deleteRoom,
    getRoomInfo,
    checkHealth,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}