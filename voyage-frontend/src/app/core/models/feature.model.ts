export type FeatureCode =
  | 'PUBLIC_BOOKING'
  | 'PUBLIC_REVIEW'
  | 'PUBLIC_PAYMENT'
  | 'CHAT_SUPPORT'
  | 'GOOGLE_LOGIN'
  | 'TOUR_SEARCH'
  | 'TOUR_FILTER'
  | 'ADMIN_DASHBOARD';

export interface FeatureFlagResponse {
  id?: number;
  code: FeatureCode;
  name?: string;
  enabled: boolean;
  description?: string;
}

export type PublicFeatureMap = Partial<Record<FeatureCode, boolean>>;
