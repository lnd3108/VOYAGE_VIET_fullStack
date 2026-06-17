import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

import {
  DestinationRegion,
  DestinationStatus,
} from '../../../../../core/models/destination.model';

export type DestinationStatusFilter = 'ALL' | DestinationStatus;
export type DestinationRegionFilter = 'ALL' | DestinationRegion;

export interface DestinationFilterOption<T> {
  label: string;
  value: T;
}

export interface DestinationFilterValue {
  keyword: string;
  status: DestinationStatusFilter;
  region: DestinationRegionFilter;
}

@Component({
  selector: 'app-admin-destination-filter',
  standalone: true,
  imports: [NgFor, NgIf, TuiIcon],
  templateUrl: './destination-filter.html',
  styleUrl: './destination-filter.scss',
})
export class AdminDestinationFilterComponent implements OnChanges {
  @Input() value: DestinationFilterValue | null = null;
  @Input() totalCount = 0;
  @Input() filteredCount = 0;

  @Output() filterChange = new EventEmitter<DestinationFilterValue>();

  focusedSelect: 'statusFilter' | 'regionFilter' | null = null;
  keywordDraft = '';
  statusDraft: DestinationStatusFilter = 'ALL';
  regionDraft: DestinationRegionFilter = 'ALL';

  readonly statusFilters: DestinationFilterOption<DestinationStatusFilter>[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Từ chối', value: 'REJECTED' },
    { label: 'Hủy trình duyệt', value: 'CANCEL_APPROVE' },
  ];
  readonly regionFilters: DestinationFilterOption<DestinationRegionFilter>[] = [
    { label: 'Tất cả khu vực', value: 'ALL' },
    { label: 'Trong nước', value: 'DOMESTIC' },
    { label: 'Quốc tế', value: 'INTERNATIONAL' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      this.keywordDraft = this.value.keyword || '';
      this.statusDraft = this.value.status || 'ALL';
      this.regionDraft = this.value.region || 'ALL';
    }
  }

  statusFilterLabel(status: DestinationStatusFilter): string {
    return this.statusFilters.find((option) => option.value === status)?.label || 'Tất cả';
  }

  regionFilterLabel(region: DestinationRegionFilter): string {
    return this.regionFilters.find((option) => option.value === region)?.label || 'Tất cả khu vực';
  }

  updateKeyword(event: Event): void {
    this.keywordDraft = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  toggleSelect(selectName: 'statusFilter' | 'regionFilter'): void {
    this.focusedSelect = this.focusedSelect === selectName ? null : selectName;
  }

  selectStatusFilter(status: DestinationStatusFilter): void {
    this.statusDraft = status;
    this.focusedSelect = null;
    this.applyFilters();
  }

  selectRegionFilter(region: DestinationRegionFilter): void {
    this.regionDraft = region;
    this.focusedSelect = null;
    this.applyFilters();
  }

  applyFilters(): void {
    this.focusedSelect = null;
    this.filterChange.emit({
      keyword: this.keywordDraft.trim(),
      status: this.statusDraft,
      region: this.regionDraft,
    });
  }

  resetFilters(): void {
    this.keywordDraft = '';
    this.statusDraft = 'ALL';
    this.regionDraft = 'ALL';
    this.focusedSelect = null;
    this.filterChange.emit({
      keyword: '',
      status: 'ALL',
      region: 'ALL',
    });
  }

  @HostListener('document:mousedown', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.admin-destinations__toolbar')) {
      this.focusedSelect = null;
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.focusedSelect = null;
  }
}
