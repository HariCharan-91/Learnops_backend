import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/constants/api';
import { Profile } from '@/types';

export class ProfileService {
  async getProfile(): Promise<Profile> {
    const response = await apiService.get<{ profile: Profile }>(API_ENDPOINTS.PROFILE);
    
    if (response.profile) {
      return response.profile;
    } else {
      throw new Error('Profile not found');
    }
  }

  async updateProfile(updateData: Partial<Profile>): Promise<Profile> {
    const response = await apiService.put<{ profile: Profile }>(API_ENDPOINTS.PROFILE, updateData);
    
    if (response.profile) {
      return response.profile;
    } else {
      throw new Error('Failed to update profile');
    }
  }
}

export const profileService = new ProfileService();