'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { profileService } from '@/features/profile/services/profile.service';
import { Profile } from '@/types';

interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updateData: Partial<Profile>) => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateProfile(updateData);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
  };
}