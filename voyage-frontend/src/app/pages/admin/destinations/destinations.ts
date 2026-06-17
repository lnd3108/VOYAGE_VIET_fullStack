import { NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { AdminDestinationApiService } from '../../../core/api/admin-destination-api.service';
import {
  AdminDestination,
  DestinationStatus,
} from '../../../core/models/destination.model';
import { AuthService } from '../../../core/auth/auth.service';
import { RoleCode } from '../../../core/models/user.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';
import { AdminDestinationBulkActionsComponent } from './components/destination-bulk-actions/destination-bulk-actions';
import { AdminDestinationDetailPanelComponent } from './components/destination-detail-panel/destination-detail-panel';
import { AdminDestinationFilterComponent, DestinationFilterValue } from './components/destination-filter/destination-filter';
import { AdminDestinationFormComponent } from './components/destination-form/destination-form';
import {
  AdminDestinationTableComponent,
  DestinationSelectionToggleEvent,
} from './components/destination-table/destination-table';
import {
  DESTINATION_FALLBACK_IMAGE,
  parseStatus,
} from './destination-utils';

@Component({
  selector: 'app-admin-destinations',
  imports: [
    AdminDestinationFilterComponent,
    AdminDestinationBulkActionsComponent,
    AdminDestinationDetailPanelComponent,
    AdminDestinationTableComponent,
    AdminDestinationFormComponent,
    NgIf,
    RouterLink,
  ],
  templateUrl: './destinations.html',
  styleUrl: './destinations.scss',
})
export class AdminDestinations implements OnInit {
  private readonly adminDestinationApiService = inject(AdminDestinationApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly authService = inject(AuthService);

  readonly fallbackImage = DESTINATION_FALLBACK_IMAGE;
  loading = false;
  errorMessage = '';
  destinations: AdminDestination[] = [];
  filteredDestinations: AdminDestination[] = [];
  currentFilters: DestinationFilterValue = {
    keyword: '',
    status: 'ALL',
    region: 'ALL',
  };
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;
  first = true;
  last = true;
  sort = 'updatedAt,desc';
  readonly pageSizeOptions = [10, 20, 50];
  selectedDestination: AdminDestination | null = null;
  isFormOpen = false;
  isEditMode = false;
  selectedDestinationIds = new Set<number>();
  selectedBatchDestinations: AdminDestination[] = [];
  selectedBatchCount = 0;
  detailDestination: AdminDestination | null = null;

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clearBatchSelection();
    this.adminDestinationApiService
      .getDestinationsPage({
        page: this.page,
        size: this.size,
        keyword: this.currentFilters.keyword,
        status: this.currentFilters.status,
        region: this.currentFilters.region,
        sort: this.sort,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const pageResponse = this.extractPageResponse(response);
          if (pageResponse) {
            this.destinations = pageResponse.content;
            this.filteredDestinations = pageResponse.content;
            this.page = pageResponse.page;
            this.size = pageResponse.size;
            this.totalElements = pageResponse.totalElements;
            this.totalPages = pageResponse.totalPages;
            this.first = pageResponse.first;
            this.last = pageResponse.last;
          } else {
            this.destinations = this.extractList(response);
            this.filteredDestinations = this.destinations;
            this.totalElements = this.destinations.length;
            this.totalPages = this.totalElements ? 1 : 0;
            this.first = true;
            this.last = true;
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải danh sách điểm đến. Vui lòng thử lại sau.');
          this.loading = false;
        },
      });
  }

  openCreateForm(): void {
    if (!this.canCreateDestination()) {
      this.denyDestinationAction();
      return;
    }

    this.isFormOpen = true;
    this.isEditMode = false;
    this.selectedDestination = null;
    this.errorMessage = '';
  }

  openEditForm(destination: AdminDestination): void {
    if (!this.canEditDestination(destination)) {
      this.denyDestinationAction();
      return;
    }

    this.isFormOpen = true;
    this.isEditMode = true;
    this.selectedDestination = destination;
    this.errorMessage = '';
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.isEditMode = false;
    this.selectedDestination = null;
  }

  handleFilterChange(filters: DestinationFilterValue): void {
    this.currentFilters = filters;
    this.page = 0;
    this.loadDestinations();
  }

  goToPreviousPage(): void {
    if (this.loading || this.first || this.page <= 0) {
      return;
    }

    this.page -= 1;
    this.loadDestinations();
  }

  goToNextPage(): void {
    if (this.loading || this.last) {
      return;
    }

    this.page += 1;
    this.loadDestinations();
  }

  changePageSize(size: number | string): void {
    const parsedSize = Number(size);

    if (!Number.isFinite(parsedSize) || parsedSize <= 0 || parsedSize === this.size) {
      return;
    }

    this.size = parsedSize;
    this.page = 0;
    this.loadDestinations();
  }

  canCreateDestination(): boolean {
    return this.hasAnyRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  canEditDestination(destination: AdminDestination): boolean {
    return this.hasAnyRole('STAFF', 'ADMIN', 'SUPER_ADMIN') && this.parseStatus(destination.status) !== 'PENDING';
  }

  canOpenFullMediaLibrary(): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN');
  }

  openPendingReview(destination: AdminDestination): void {
    this.detailDestination = destination;
  }

  closePendingReview(): void {
    this.detailDestination = null;
  }

  handleDestinationSelectionToggle(event: DestinationSelectionToggleEvent): void {
    const id = event.destination.id;

    if (!id) {
      return;
    }

    if (event.checked) {
      this.selectedDestinationIds.add(id);
    } else {
      this.selectedDestinationIds.delete(id);
    }

    this.syncBatchSelection();
  }

  clearBatchSelection(): void {
    this.selectedDestinationIds.clear();
    this.syncBatchSelection();
  }

  private syncBatchSelection(): void {
    this.selectedBatchDestinations = this.destinations.filter((destination) => !!destination.id && this.selectedDestinationIds.has(destination.id));
    this.selectedBatchCount = this.selectedBatchDestinations.length;
  }

  private extractPageResponse(response: unknown): PageResponse<AdminDestination> | null {
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;

    if (!this.isRecord(source) || !Array.isArray(source['content'])) {
      return null;
    }

    const content = source['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    const page = this.parseNumber(source['page']) ?? this.parseNumber(source['number']) ?? this.page;
    const size = this.parseNumber(source['size']) ?? this.size;
    const totalElements = this.parseNumber(source['totalElements']) ?? content.length;
    const totalPages = this.parseNumber(source['totalPages']) ?? (totalElements ? Math.ceil(totalElements / size) : 0);

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
      first: typeof source['first'] === 'boolean' ? source['first'] : page <= 0,
      last: typeof source['last'] === 'boolean' ? source['last'] : page >= Math.max(totalPages - 1, 0),
      empty: typeof source['empty'] === 'boolean' ? source['empty'] : content.length === 0,
      sortBy: typeof source['sortBy'] === 'string' ? source['sortBy'] : undefined,
      sortDir: typeof source['sortDir'] === 'string' ? source['sortDir'] : undefined,
    };
  }

  private extractList(response: unknown): AdminDestination[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    return [];
  }

  private normalizeDestination(value: unknown): AdminDestination | null {
    if (!this.isRecord(value)) {
      return null;
    }

    return value as AdminDestination;
  }

  private hasAnyRole(...roles: RoleCode[]): boolean {
    return this.authService.hasRole(...roles);
  }

  private denyDestinationAction(): void {
    this.errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
    this.feedback.warning(this.errorMessage);
  }

  private parseStatus(status?: string): DestinationStatus | null {
    return parseStatus(status);
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý điểm đến.';
      }

      const errorBody = error['error'];

      if (this.isRecord(errorBody) && typeof errorBody['message'] === 'string') {
        return errorBody['message'];
      }
    }

    return fallback;
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private isDestination(value: AdminDestination | null): value is AdminDestination {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
