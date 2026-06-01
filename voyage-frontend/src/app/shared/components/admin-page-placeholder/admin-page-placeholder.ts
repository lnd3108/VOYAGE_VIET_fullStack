import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-page-placeholder',
  imports: [],
  templateUrl: './admin-page-placeholder.html',
})
export class AdminPagePlaceholder {
  @Input({ required: true }) title = '';
  @Input() eyebrow = 'ADMIN PAGE';
  @Input() description = '';
  @Input() status = 'Chức năng sẽ được triển khai ở giai đoạn sau.';
  @Input() primaryBadge = 'Placeholder';
  @Input() secondaryBadge = 'No API call';
}
