export type DestinationStatus = 'ACTIVE' | 'INACTIVE';
export type DestinationRegion = 'DOMESTIC' | 'INTERNATIONAL';
export type DestinationSubRegion = 'NORTH' | 'CENTRAL' | 'SOUTH';

export interface CountryOption {
  name: {
    common: string;
    official: string;
  };
  cca2?: string;
  translations?: Record<string, { official?: string; common?: string }>;
  flags: {
    svg: string;
    png: string;
    alt?: string;
  };
  population: number;
}

export interface CountriesNowCitiesResponse {
  error?: boolean;
  msg?: string;
  data?: string[];
}

export interface ProvinceRegionMap {
  NORTH: string[];
  CENTRAL: string[];
  SOUTH: string[];
}

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
