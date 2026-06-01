import { CategoryResponse } from './category.model';
import { DestinationResponse } from './destination.model';
import { TourCardResponse } from './tour.model';

export interface HomeResponse {
  categories: CategoryResponse[];
  destinations: DestinationResponse[];
  featuredTours: TourCardResponse[];
}

export interface HomePromotionBanner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link: string;
  badge?: string;
}

export interface HomeImageDestination {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  tourCount?: number;
  size?: 'large' | 'normal';
}

export interface HomeVisaRegion {
  id: number;
  name: string;
  imageUrl: string;
  link: string;
}

export interface HomeDealGroup {
  id: string;
  label: string;
  tours: TourCardResponse[];
}
