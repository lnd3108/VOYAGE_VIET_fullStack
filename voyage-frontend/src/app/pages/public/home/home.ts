import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

interface HomeHeroSidebarItem {
  id: string;
  label: string;
  iconUrl: string;
  hasBuiltInLabel?: boolean;
}

interface HomeHeroMegaColumn {
  title: string;
  links: string[];
}

interface HomeHeroHotDestination {
  name: string;
  tourCount: number;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, NgClass, NgFor, NgIf, RouterLink, TuiIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly activeSidebarMenu = signal<string | null>(null);
  activeDropdown: 'destination' | 'guest' | null = null;
  departureDate = '';

  adultCount = 1;
  childCount = 0;

  readonly sidebarItems: HomeHeroSidebarItem[] = [
    {
      id: 'domestic',
      label: 'Tour trong nước',
      iconUrl: '/hero/sidebar-options/inside.svg',
    },
    {
      id: 'international',
      label: 'Tour nước ngoài',
      iconUrl: '/hero/sidebar-options/outside.svg',
    },
    {
      id: 'group',
      label: 'Tour đoàn',
      iconUrl: '/hero/sidebar-options/Group.svg',
    },
    {
      id: 'combo',
      label: 'Tour combo',
      iconUrl: '/hero/sidebar-options/combo-tour.svg',
    },
    {
      id: 'visa',
      label: 'Visa',
      iconUrl: '/hero/sidebar-options/visa.svg',
      hasBuiltInLabel: true,
    },
    {
      id: 'flight',
      label: 'Vé máy bay',
      iconUrl: '/hero/sidebar-options/ve-maybay.svg',
    },
  ];

  readonly megaMenus: Record<string, HomeHeroMegaColumn[]> = {
    domestic: [
      {
        title: 'Tour miền Bắc',
        links: [
          'Du lịch Tây Bắc',
          'Du lịch Hà Nội',
          'Du lịch Hạ Long',
          'Du lịch Ninh Bình',
          'Du lịch Sapa',
          'Du lịch Lào Cai',
          'Du lịch Hà Giang',
        ],
      },
      {
        title: 'Tour miền Trung',
        links: [
          'Du lịch Đà Nẵng',
          'Du lịch Hội An',
          'Du lịch Huế',
          'Du lịch Nha Trang',
          'Du lịch Tây Nguyên',
          'Du lịch Phan Thiết',
          'Du lịch Phú Yên',
        ],
      },
      {
        title: 'Tour miền Nam',
        links: [
          'Du lịch Côn Đảo',
          'Du lịch Phú Quốc',
          'Du lịch Nam Du',
          'Du lịch Cần Thơ',
          'Du lịch Vũng Tàu',
          'Du lịch TP. Hồ Chí Minh',
        ],
      },
      {
        title: 'Tour Tây Nguyên',
        links: ['Du lịch Tà Đùng', 'Du lịch Buôn Mê Thuột', 'Du lịch Đà Lạt'],
      },
    ],
    international: [
      {
        title: 'Tour châu Á',
        links: [
          'Du lịch Hàn Quốc',
          'Du lịch Nhật Bản',
          'Du lịch Singapore',
          'Du lịch Thái Lan',
          'Du lịch Campuchia',
          'Du lịch Malaysia',
          'Du lịch Indonesia',
        ],
      },
      {
        title: 'Tour châu Âu',
        links: [
          'Du lịch Pháp',
          'Du lịch Hà Lan',
          'Du lịch Đức',
          'Du lịch Italia',
          'Du lịch Thụy Sỹ',
          'Du lịch Anh',
          'Du lịch Tây Ban Nha',
        ],
      },
      {
        title: 'Tour châu Mỹ',
        links: ['Du lịch Mỹ', 'Du lịch Canada'],
      },
      {
        title: 'Tour châu Úc',
        links: ['Du lịch Úc', 'Du lịch New Zealand'],
      },
      {
        title: 'Tour châu Phi',
        links: ['Du lịch Nam Phi'],
      },
    ],
    group: [
      {
        title: 'Tour đoàn doanh nghiệp',
        links: ['Team building', 'Gala dinner', 'Du lịch công ty', 'Du lịch khen thưởng'],
      },
      {
        title: 'Tour đoàn trường học',
        links: ['Tham quan học tập', 'Trải nghiệm hè', 'Tour học sinh', 'Tour sinh viên'],
      },
      {
        title: 'Tour đoàn gia đình',
        links: ['Tour nghỉ dưỡng', 'Tour cuối tuần', 'Tour biển đảo', 'Tour cao cấp'],
      },
    ],
    combo: [
      {
        title: 'Combo du lịch',
        links: ['Combo Đà Nẵng', 'Combo Phú Quốc', 'Combo Nha Trang', 'Combo Đà Lạt'],
      },
      {
        title: 'Combo nghỉ dưỡng',
        links: ['Resort 4 sao', 'Resort 5 sao', 'Villa gia đình', 'Honeymoon package'],
      },
    ],
    visa: [
      {
        title: 'Làm visa châu Á',
        links: [
          'Làm visa Nhật Bản',
          'Làm visa Hàn Quốc',
          'Làm visa Dubai',
          'Làm visa Trung Quốc',
          'Làm visa Singapore',
          'Làm visa Thái Lan',
        ],
      },
      {
        title: 'Làm visa châu Âu',
        links: [
          'Làm visa Tây Ban Nha',
          'Làm visa Italia',
          'Làm visa Pháp',
          'Làm visa Thổ Nhĩ Kỳ',
          'Làm visa Hà Lan',
        ],
      },
      {
        title: 'Làm visa châu Mỹ',
        links: ['Làm visa Mỹ', 'Làm visa Canada'],
      },
      {
        title: 'Làm visa châu Úc',
        links: ['Làm visa Úc'],
      },
    ],
    flight: [
      {
        title: 'Vé máy bay nội địa',
        links: ['Vé đi Hà Nội', 'Vé đi Đà Nẵng', 'Vé đi Phú Quốc', 'Vé đi Nha Trang'],
      },
      {
        title: 'Vé máy bay quốc tế',
        links: ['Vé đi Thái Lan', 'Vé đi Hàn Quốc', 'Vé đi Nhật Bản', 'Vé đi Singapore'],
      },
    ],
  };

  readonly hotDestinations: HomeHeroHotDestination[] = [
    {
      name: 'Pháp - Thụy Sỹ - Ý',
      tourCount: 50,
      imageUrl: '/home/destinations/foreign-chau-au.jpg',
    },
    {
      name: 'Bắc Âu',
      tourCount: 50,
      imageUrl: '/home/tours/international-2.jpg',
    },
    {
      name: 'Pháp - Đức - Bỉ - Hà Lan',
      tourCount: 50,
      imageUrl: '/home/tours/international-3.jpg',
    },
    {
      name: 'Hàn Quốc',
      tourCount: 50,
      imageUrl: '/home/destinations/foreign-thai-lan.jpg',
    },
    {
      name: 'Nhật Bản',
      tourCount: 50,
      imageUrl: '/home/tours/international-1.jpg',
    },
    {
      name: 'Singapore',
      tourCount: 50,
      imageUrl: '/home/destinations/foreign-bali.jpg',
    },
    {
      name: 'Thái Lan',
      tourCount: 50,
      imageUrl: '/home/destinations/foreign-thai-lan.jpg',
    },
    {
      name: 'Bali',
      tourCount: 50,
      imageUrl: '/home/destinations/foreign-bali.jpg',
    },
    {
      name: 'Phú Quốc',
      tourCount: 50,
      imageUrl: '/home/destinations/domestic-phu-quoc.jpg',
    },
    {
      name: 'Hà Nội',
      tourCount: 50,
      imageUrl: '/home/destinations/domestic-ha-noi.jpg',
    },
    {
      name: 'Sapa',
      tourCount: 50,
      imageUrl: '/home/destinations/domestic-sa-pa.jpg',
    },
    {
      name: 'Nha Trang',
      tourCount: 50,
      imageUrl: '/home/tours/domestic-1.jpg',
    },
  ];

  setActiveSidebarMenu(menuId: string | null): void {
    this.activeSidebarMenu.set(menuId);
  }

  @HostListener('document:click')
  closeDropdownsOnOutsideClick(): void {
    this.closeDropdown();
  }

  toggleDropdown(type: 'destination' | 'guest'): void {
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }

  openDatePicker(input: HTMLInputElement): void {
    this.activeDropdown = null;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  increaseAdult(): void {
    this.adultCount++;
  }

  decreaseAdult(): void {
    if (this.adultCount > 1) {
      this.adultCount--;
    }
  }

  increaseChild(): void {
    this.childCount++;
  }

  decreaseChild(): void {
    if (this.childCount > 0) {
      this.childCount--;
    }
  }
}
