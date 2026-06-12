import {
  AdminDestination,
  DestinationStatus,
  isDestinationDisplayEnabled,
} from '../../../core/models/destination.model';

export const DESTINATION_FALLBACK_IMAGE = '/hero/bg-home.png';

export function parseStatus(status?: string | null): DestinationStatus | null {
  return status === 'DRAFT' ||
    status === 'PENDING' ||
    status === 'APPROVED' ||
    status === 'REJECTED' ||
    status === 'CANCEL_APPROVE'
    ? status
    : null;
}

export function statusLabel(status?: string | null): string {
  return workflowLabel(status);
}

export function statusClass(status?: string | null): string {
  return workflowClass(status);
}

export function workflowLabel(status?: string | null): string {
  switch (parseStatus(status)) {
    case 'DRAFT':
      return 'Nháp';
    case 'PENDING':
      return 'Chờ duyệt';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Từ chối';
    case 'CANCEL_APPROVE':
      return 'Hủy trình duyệt';
    default:
      return 'Chưa xác định';
  }
}

export function workflowClass(status?: string | null): string {
  return `admin-destinations__status--${(parseStatus(status) || 'draft').toLowerCase().replace('_', '-')}`;
}

export function isDisplayEnabled(destination: AdminDestination): boolean {
  return isDestinationDisplayEnabled(destination.isDisplay);
}

export function isDisplayValueEnabled(value: unknown): boolean {
  return isDestinationDisplayEnabled(value as string | number | boolean | null | undefined);
}

export function displayLabel(destination: AdminDestination): string {
  if (parseStatus(destination.status) !== 'APPROVED') {
    return 'Chưa thể hiển thị';
  }

  return isDisplayEnabled(destination) ? 'Đang hiển thị' : 'Đang ẩn';
}

export function displayClass(destination: AdminDestination): string {
  if (parseStatus(destination.status) !== 'APPROVED') {
    return 'admin-destinations__display--blocked';
  }

  return isDisplayEnabled(destination)
    ? 'admin-destinations__display--shown'
    : 'admin-destinations__display--hidden';
}

export function hasPendingData(destination: AdminDestination): boolean {
  return typeof destination.newData === 'string' && destination.newData.trim().length > 0;
}

export function formatRegion(value?: string): string {
  if (value === 'DOMESTIC') {
    return 'Trong nước';
  }

  if (value === 'INTERNATIONAL') {
    return 'Quốc tế';
  }

  return value || 'Chưa phân vùng';
}

export function formatDate(value?: string): string {
  if (!value) {
    return 'Đang cập nhật';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN').format(date);
}

export function getDestinationImage(destination: AdminDestination, fallback = DESTINATION_FALLBACK_IMAGE): string {
  return destination.imageUrl || fallback;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

export function generateSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
