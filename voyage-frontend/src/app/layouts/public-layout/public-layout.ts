import { NgFor, NgIf } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [NgFor, NgIf, RouterLink, RouterOutlet, TuiIcon],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  readonly authService = inject(AuthService);

  readonly selectedDepartureLocation = signal('ĐÀ NẴNG');
  readonly departureDropdownOpen = signal(false);

  readonly departureLocations = ['ĐÀ NẴNG', 'HÀ NỘI', 'TP. HỒ CHÍ MINH'];

  @HostListener('document:click')
  closeHeaderDropdowns(): void {
    this.departureDropdownOpen.set(false);
  }

  toggleDepartureDropdown(): void {
    this.departureDropdownOpen.update((value) => !value);
  }

  selectDepartureLocation(location: string): void {
    this.selectedDepartureLocation.set(location);
    this.departureDropdownOpen.set(false);
  }
}
