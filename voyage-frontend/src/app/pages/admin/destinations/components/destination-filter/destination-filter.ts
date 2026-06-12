import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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

@Component({
  selector: 'app-admin-destination-filter',
  standalone: true,
  imports: [NgFor, NgIf, TuiIcon],
  templateUrl: './destination-filter.html',
  styleUrl: './destination-filter.scss',
})
export class AdminDestinationFilterComponent {
  @Input() keyword = '';
  @Input() statusFilter: DestinationStatusFilter = 'ALL';
  @Input() regionFilter: DestinationRegionFilter = 'ALL';
  @Input() statusFilters: DestinationFilterOption<DestinationStatusFilter>[] = [];
  @Input() regionFilters: DestinationFilterOption<DestinationRegionFilter>[] = [];
  @Input() totalCount = 0;
  @Input() filteredCount = 0;

  @Output() keywordChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<DestinationStatusFilter>();
  @Output() regionFilterChange = new EventEmitter<DestinationRegionFilter>();
  @Output() search = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  focusedSelect: 'statusFilter' | 'regionFilter' | null = null;

  statusFilterLabel(status: DestinationStatusFilter): string {
    return this.statusFilters.find((option) => option.value === status)?.label || 'Tất cả';
  }

  regionFilterLabel(region: DestinationRegionFilter): string {
    return this.regionFilters.find((option) => option.value === region)?.label || 'Tất cả khu vực';
  }

  updateKeyword(event: Event): void {
    this.keywordChange.emit((event.target as HTMLInputElement).value);
  }

  toggleSelect(selectName: 'statusFilter' | 'regionFilter'): void {
    this.focusedSelect = this.focusedSelect === selectName ? null : selectName;
  }

  selectStatusFilter(status: DestinationStatusFilter): void {
    this.statusFilterChange.emit(status);
    this.focusedSelect = null;
  }

  selectRegionFilter(region: DestinationRegionFilter): void {
    this.regionFilterChange.emit(region);
    this.focusedSelect = null;
  }

  requestSearch(): void {
    this.focusedSelect = null;
    this.search.emit();
  }

  requestReset(): void {
    this.focusedSelect = null;
    this.reset.emit();
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
