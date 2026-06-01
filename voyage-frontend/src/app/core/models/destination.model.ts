export type DestinationStatus = 'ACTIVE' | 'INACTIVE';

export interface DestinationResponse {
  id: number;
  name: string;
  slug: string;
  region?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: DestinationStatus;
}
