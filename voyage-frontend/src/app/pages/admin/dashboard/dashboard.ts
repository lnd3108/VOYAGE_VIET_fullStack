import { Component } from '@angular/core';

import { AdminPagePlaceholder } from '../../../shared/components/admin-page-placeholder/admin-page-placeholder';

@Component({
  selector: 'app-dashboard',
  imports: [AdminPagePlaceholder],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
