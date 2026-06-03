export interface AdminMediaItem {
  id?: number;
  url?: string;
  imageUrl?: string;
  secureUrl?: string;
  fileUrl?: string;
  mediaUrl?: string;
  publicId?: string;
  type?: string;
  mediaType?: string;
  module?: string;
  folder?: string;
  format?: string;
  resourceType?: string;
  originalFilename?: string;
  sizeBytes?: number;
  bytes?: number;
  contentType?: string;
  width?: number;
  height?: number;
  createdAt?: string;
  updatedAt?: string;
  data?: Partial<AdminMediaItem>;
}

export interface AdminMediaListParams {
  module?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc' | string;
}

export interface AdminMediaUploadResponse extends AdminMediaItem {
  media?: AdminMediaItem;
}
