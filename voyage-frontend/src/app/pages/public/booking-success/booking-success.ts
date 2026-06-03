import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-success',
  imports: [NgIf, RouterLink],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.scss',
})
export class BookingSuccess {
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly bookingCode = this.activatedRoute.snapshot.queryParamMap.get('bookingCode');
  readonly bookingId = this.activatedRoute.snapshot.queryParamMap.get('bookingId');
}
