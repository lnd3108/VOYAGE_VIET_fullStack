import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

interface FloatingSocialItem {
  label: string;
  iconUrl: string;
  link: string;
}

@Component({
  selector: 'app-home-floating-social',
  imports: [NgFor],
  templateUrl: './home-floating-social.html',
  styleUrl: './home-floating-social.scss',
})
export class HomeFloatingSocialComponent {
  readonly socialItems: FloatingSocialItem[] = [
    {
      label: 'Facebook',
      iconUrl: '/home/mxh/facebook.svg',
      link: '#',
    },
    {
      label: 'Instagram',
      iconUrl: '/home/mxh/insta.svg',
      link: '#',
    },
    {
      label: 'WhatsApp',
      iconUrl: '/home/mxh/phone.svg',
      link: '#',
    },
    {
      label: 'Zalo',
      iconUrl: '/home/mxh/zalo.svg',
      link: '#',
    },
    {
      label: 'YouTube',
      iconUrl: '/home/mxh/youtube.svg',
      link: '#',
    },
  ];
}
