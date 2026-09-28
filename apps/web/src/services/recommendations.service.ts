import apiClient from '@/lib/axios';
import type {
  Recommendation,
  UserRecommendationsResponse,
  RecommendationsInboxResponse,
} from '@/types';

export interface RequestRecommendationPayload {
  targetUserId: string;
  positionTitle: string;
  positionId?: string;
  relationship: string;
  requestMessage?: string;
}

export interface GiveRecommendationPayload {
  recipientId: string;
  positionTitle: string;
  positionId?: string;
  relationship: string;
  content: string;
}

export interface RespondToRequestPayload {
  content: string;
  relationship?: string;
}

export interface RequestRevisionPayload {
  revisionNote: string;
}

export interface ReviseRecommendationPayload {
  content: string;
}

export const recommendationsService = {
  async getUserRecommendations(userId: string): Promise<UserRecommendationsResponse> {
    const res = await apiClient.get<{ success: boolean; data: UserRecommendationsResponse }>(
      `/recommendations/user/${userId}`
    );
    return (res.data as any)?.data || res.data;
  },

  async requestRecommendation(payload: RequestRecommendationPayload): Promise<Recommendation> {
    const res = await apiClient.post<{ success: boolean; data: Recommendation }>(
      '/recommendations/request',
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async giveRecommendation(payload: GiveRecommendationPayload): Promise<Recommendation> {
    const res = await apiClient.post<{ success: boolean; data: Recommendation }>(
      '/recommendations/give',
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async respondToRequest(id: string, payload: RespondToRequestPayload): Promise<Recommendation> {
    const res = await apiClient.put<{ success: boolean; data: Recommendation }>(
      `/recommendations/${id}/respond`,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async acceptRecommendation(id: string): Promise<Recommendation> {
    const res = await apiClient.put<{ success: boolean; data: Recommendation }>(
      `/recommendations/${id}/accept`
    );
    return (res.data as any)?.data || res.data;
  },

  async dismissRecommendation(id: string): Promise<Recommendation> {
    const res = await apiClient.put<{ success: boolean; data: Recommendation }>(
      `/recommendations/${id}/dismiss`
    );
    return (res.data as any)?.data || res.data;
  },

  async requestRevision(id: string, payload: RequestRevisionPayload): Promise<Recommendation> {
    const res = await apiClient.put<{ success: boolean; data: Recommendation }>(
      `/recommendations/${id}/request-revision`,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async reviseRecommendation(
    id: string,
    payload: ReviseRecommendationPayload
  ): Promise<Recommendation> {
    const res = await apiClient.put<{ success: boolean; data: Recommendation }>(
      `/recommendations/${id}/revise`,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  async toggleHideRecommendation(id: string): Promise<Recommendation> {
    const res = await apiClient.put<{ success: boolean; data: Recommendation }>(
      `/recommendations/${id}/toggle-hide`
    );
    return (res.data as any)?.data || res.data;
  },

  async deleteRecommendation(id: string): Promise<{ success: boolean; id: string }> {
    const res = await apiClient.delete<{ success: boolean; data: { success: boolean; id: string } }>(
      `/recommendations/${id}`
    );
    return (res.data as any)?.data || res.data;
  },

  async getInbox(): Promise<RecommendationsInboxResponse> {
    const res = await apiClient.get<{ success: boolean; data: RecommendationsInboxResponse }>(
      '/recommendations/inbox'
    );
    return (res.data as any)?.data || res.data;
  },
};
