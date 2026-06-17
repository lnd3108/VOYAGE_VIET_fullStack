import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AdminDestination } from '../../../../../core/models/destination.model';
import {
  DESTINATION_FALLBACK_IMAGE,
  displayClass,
  displayLabel,
  formatDate,
  formatRegion,
  getDestinationImage,
  hasPendingData,
  isDisplayEnabled,
  statusClass,
  statusLabel,
} from '../../destination-utils';
import { AdminDestinationActionCellComponent } from '../destination-action-cell/destination-action-cell';

export interface DestinationSelectionToggleEvent {
  destination: AdminDestination;
  checked: boolean;
}

@Component({
  selector: 'app-admin-destination-table',
  standalone: true,
  imports: [AdminDestinationActionCellComponent, NgClass, NgFor, NgIf],
  templateUrl: './destination-table.html',
  styleUrl: './destination-table.scss',
})
export class AdminDestinationTableComponent {
  @Input() destinations: AdminDestination[] = [];
  @Input() loading = false;
  @Input() selectedDestinationIds: Set<number> | number[] = new Set<number>();

  @Input() page = 0;
  @Input() size = 20;
  @Input() totalElements = 0;
  @Input() totalPages = 0;
  @Input() first = true;
  @Input() last = true;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  @Input() fallbackImage = DESTINATION_FALLBACK_IMAGE;
  @Input() showEmpty = true;

  @Output() selectionToggle = new EventEmitter<DestinationSelectionToggleEvent>();
  @Output() editRequested = new EventEmitter<AdminDestination>();
  @Output() reviewRequested = new EventEmitter<AdminDestination>();
  @Output() completed = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() pageSizeChange = new EventEmitter<number | string>();

  readonly skeletonRows = [1, 2, 3, 4, 5];

  isDestinationSelected(destination: AdminDestination): boolean {
    if (!destination.id) {
      return false;
    }

    return Array.isArray(this.selectedDestinationIds)
      ? this.selectedDestinationIds.includes(destination.id)
      : this.selectedDestinationIds.has(destination.id);
  }

  toggleSelection(destination: AdminDestination, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectionToggle.emit({ destination, checked });
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  getDestinationImage(destination: AdminDestination): string {
    return getDestinationImage(destination, this.fallbackImage);
  }

  statusLabel(status?: string): string {
    return statusLabel(status);
  }

  statusClass(status?: string): string {
    return statusClass(status);
  }

  displayLabel(destination: AdminDestination): string {
    return displayLabel(destination);
  }

  displayClass(destination: AdminDestination): string {
    return displayClass(destination);
  }

  pendingDataLabel(destination: AdminDestination): string {
    return hasPendingData(destination) ? 'Có dữ liệu chờ duyệt' : 'Không có';
  }

  pendingDataClass(destination: AdminDestination): string {
    return hasPendingData(destination) ? 'admin-destinations__pending--yes' : 'admin-destinations__pending--no';
  }

  isDisplayEnabled(destination: AdminDestination): boolean {
    return isDisplayEnabled(destination);
  }

  formatRegion(value?: string): string {
    return formatRegion(value);
  }

  formatDate(value?: string): string {
    return formatDate(value);
  }
}
