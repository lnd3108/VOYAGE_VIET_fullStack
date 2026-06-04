export type DestinationStatus = 'ACTIVE' | 'INACTIVE';

export interface DestinationResponse {
  id?: number;
  name?: string;
  slug?: string;
  region?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: DestinationStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDestination {
  id?: number;
  name?: string;
  slug?: string;
  region?: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: DestinationStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDestinationCreateRequest {
  name: string;
  slug: string;
  region: string;
  country: string;
  description?: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AdminDestinationUpdateRequest extends AdminDestinationCreateRequest {
  status?: DestinationStatus;
}
