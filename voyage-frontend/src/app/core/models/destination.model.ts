export type DestinationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCEL_APPROVE';
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

export type DestinationDisplayValue = number | boolean | string | null | undefined;

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
  isDisplay?: DestinationDisplayValue;
  rejectReason?: string | null;
  newData?: string | null;
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
  isDisplay?: DestinationDisplayValue;
  rejectReason?: string | null;
  newData?: string | null;
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

export interface DestinationNewData {
  name?: string | null;
  slug?: string | null;
  region?: string | null;
  country?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status?: DestinationStatus | string | null;
  isDisplay?: DestinationDisplayValue;
}

export interface DestinationBatchActionItemResponse {
  id: number | null;
  name?: string | null;
  success: boolean;
  message?: string | null;
}

export interface DestinationBatchActionResponse {
  total: number;
  successCount: number;
  failedCount: number;
  successItems: DestinationBatchActionItemResponse[];
  failedItems: DestinationBatchActionItemResponse[];
}

export function isDestinationDisplayEnabled(value: DestinationDisplayValue): boolean {
  return value === 1 || value === true || value === '1' || value === 'true';
}

export function isDestinationSelectableForTour(destination: Pick<AdminDestination, 'status' | 'isDisplay'>): boolean {
  return destination.status === 'APPROVED' && isDestinationDisplayEnabled(destination.isDisplay);
}
