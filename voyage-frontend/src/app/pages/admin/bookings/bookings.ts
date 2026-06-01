import { Component } from '@angular/core';

import { AdminPagePlaceholder } from '../../../shared/components/admin-page-placeholder/admin-page-placeholder';

@Component({
  selector: 'app-admin-bookings',
  imports: [AdminPagePlaceholder],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class AdminBookings {}
