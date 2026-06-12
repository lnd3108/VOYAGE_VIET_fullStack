import { NgIf } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

type NavGroup = 'tong-quan' | 'noi-dung' | 'van-hanh' | 'he-thong' | 'khac' | null;

const ROUTE_GROUP_MAP: Array<{ prefix: string; group: Exclude<NavGroup, null> }> = [
  { prefix: '/admin/categories', group: 'noi-dung' },
  { prefix: '/admin/destinations', group: 'noi-dung' },
  { prefix: '/admin/tours', group: 'noi-dung' },
  { prefix: '/admin/bookings', group: 'van-hanh' },
  { prefix: '/admin/reviews', group: 'van-hanh' },
  { prefix: '/admin/users', group: 'he-thong' },
  { prefix: '/admin/media', group: 'he-thong' },
  { prefix: '/admin/features', group: 'he-thong' },
  { prefix: '/admin/audit-logs', group: 'he-thong' },
  { prefix: '/admin/visa', group: 'khac' },
  { prefix: '/admin/flights', group: 'khac' },
  { prefix: '/admin', group: 'tong-quan' },
];

@Component({
  selector: 'app-admin-layout',
  imports: [NgIf, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly activeGroup = signal<NavGroup>(null);
  readonly railCollapsed = signal(false);
  readonly groupTitle = computed(() => {
    switch (this.activeGroup()) {
      case 'tong-quan':
        return 'Tổng quan';
      case 'noi-dung':
        return 'Nội dung';
      case 'van-hanh':
        return 'Vận hành';
      case 'he-thong':
        return 'Hệ thống';
      case 'khac':
        return 'Khác';
      default:
        return 'Menu';
    }
  });

  constructor() {
    this.syncActiveGroup(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.syncActiveGroup(event.urlAfterRedirects));
  }

  toggleGroup(group: Exclude<NavGroup, null>): void {
    this.activeGroup.update((current) => (current === group ? null : group));
  }

  isGroupActive(group: Exclude<NavGroup, null>): boolean {
    return this.activeGroup() === group;
  }

  toggleRail(): void {
    this.railCollapsed.update((collapsed) => !collapsed);
  }

  private syncActiveGroup(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const match = ROUTE_GROUP_MAP.find((item) => path.startsWith(item.prefix));

    this.activeGroup.set(match?.group ?? 'tong-quan');
  }
}
