import { Component } from '@angular/core';

import { AdminPagePlaceholder } from '../../../shared/components/admin-page-placeholder/admin-page-placeholder';

@Component({
  selector: 'app-admin-audit-logs',
  imports: [AdminPagePlaceholder],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.scss',
})
export class AdminAuditLogs {}
