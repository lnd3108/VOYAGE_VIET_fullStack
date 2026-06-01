import { Component } from '@angular/core';

import { AdminPagePlaceholder } from '../../../shared/components/admin-page-placeholder/admin-page-placeholder';

@Component({
  selector: 'app-admin-users',
  imports: [AdminPagePlaceholder],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class AdminUsers {}
