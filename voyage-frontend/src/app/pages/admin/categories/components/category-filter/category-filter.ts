import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

import { CategoryStatus } from '../../../../../core/models/category.model';

export type AdminCategoryStatusFilter = 'ALL' | CategoryStatus;

export interface AdminCategoryStatusFilterOption {
  label: string;
  value: AdminCategoryStatusFilter;
}

@Component({
  selector: 'app-admin-category-filter',
  standalone: true,
  imports: [NgFor, NgIf, TuiIcon],
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.scss',
})
export class AdminCategoryFilterComponent {
  @Input() keyword = '';
  @Input() statusFilter: AdminCategoryStatusFilter = 'ALL';
  @Input() statusFilters: AdminCategoryStatusFilterOption[] = [];
  @Input() filteredCount = 0;
  @Input() totalCount = 0;
  @Input() disabled = false;

  @Output() keywordChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<AdminCategoryStatusFilter>();

  isStatusOpen = false;

  get selectedStatusLabel(): string {
    return (
      this.statusFilters.find((option) => option.value === this.statusFilter)?.label || 'Tất cả'
    );
  }

  updateKeyword(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.keywordChange.emit(value);
  }

  toggleStatusSelect(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.isStatusOpen = !this.isStatusOpen;
  }

  selectStatus(status: AdminCategoryStatusFilter): void {
    if (this.disabled) {
      return;
    }

    this.statusFilterChange.emit(status);
    this.isStatusOpen = false;
  }

  @HostListener('document:mousedown', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target?.closest('.admin-category-filter__select')) {
      this.isStatusOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.isStatusOpen = false;
  }
}
