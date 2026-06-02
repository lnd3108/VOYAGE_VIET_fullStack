import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TuiDay } from '@taiga-ui/cdk/date-time';
import { TuiButton, TuiCalendar, TuiDropdown, TuiIcon } from '@taiga-ui/core';

interface HomeHeroSidebarItem {
  id: string;
  label: string;
  iconUrl: string;
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
  selector: 'app-home-hero',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgFor,
    NgIf,
    RouterLink,
    TuiButton,
    TuiDropdown,
    TuiIcon,
    TuiCalendar,
  ],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss',
})
export class HomeHero {
  private readonly router = inject(Router);

  readonly activeSidebarMenu = signal<string | null>(null);

  keyword = '';
  departureLocation = '';
  selectedDestination: HomeHeroHotDestination | null = null;
  departureDate: TuiDay | null = null;
  guestDropdownOpen = false;
  dateDropdownOpen = false;
  destDropdownOpen = false;

  adultCount = 0;
  childCount = 0;

  readonly guestTitle = 'Số lượng';

  get totalPeople(): number {
    return this.adultCount + this.childCount;
  }

  get departureDateLabel(): string {
    return this.departureDate ? this.departureDate.toString('dd/mm/yyyy', '/') : 'Ngày đi';
  }

  get guestLabel(): string {
    if (this.adultCount === 0 && this.childCount === 0) {
      return 'Số lượng';
    }

    const parts: string[] = [];

    if (this.adultCount > 0) {
      parts.push(`${this.adultCount} người lớn`);
    }

    if (this.childCount > 0) {
      parts.push(`${this.childCount} trẻ em`);
    }

    return parts.join(', ');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.home-search__dest-wrap')) {
      this.destDropdownOpen = false;
    }
    if (!target.closest('.home-search__field-wrap')) {
      this.guestDropdownOpen = false;
    }
    if (!target.closest('.home-search__date-wrap') && !target.closest('.home-search__calendar')) {
      this.dateDropdownOpen = false;
    }
  }

  readonly sidebarItems: HomeHeroSidebarItem[] = [
    { id: 'domestic', label: 'Tour trong nước', iconUrl: '/hero/sidebar-options/inside.svg' },
    { id: 'international', label: 'Tour nước ngoài', iconUrl: '/hero/sidebar-options/outside.svg' },
    { id: 'group', label: 'Tour đoàn', iconUrl: '/hero/sidebar-options/Group.svg' },
    { id: 'combo', label: 'Tour combo', iconUrl: '/hero/sidebar-options/combo-tour.svg' },
    { id: 'visa', label: 'VISA', iconUrl: '/hero/sidebar-options/visa.svg' },
    { id: 'flight', label: 'Vé máy bay', iconUrl: '/hero/sidebar-options/ve-maybay.svg' },
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
          'Du lịch Phong Nha',
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
          'Du lịch Tiền Giang',
          'Du lịch Vĩnh Long',
          'Du lịch An Giang',
          'Du lịch Sóc Trăng',
          'Du lịch Bạc Liêu',
          'Du lịch Cà Mau',
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
          'Du lịch Hồng Kông',
          'Du lịch Trung Quốc',
          'Du lịch Đài Loan',
          'Du lịch Myanmar',
          'Du lịch Ấn Độ',
          'Du lịch Maldives',
          'Du lịch Abu Dhabi',
          'Du lịch Dubai',
          'Du lịch Lào',
          'Du lịch Philippines',
          'Du lịch Brunei',
          'Du lịch Israel',
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
          'Du lịch Nga',
          'Du lịch Thụy Điển',
          'Du lịch Thổ Nhĩ Kỳ',
          'Du lịch Na Uy',
          'Du lịch Đan Mạch',
          'Du lịch Phần Lan',
        ],
      },
      { title: 'Tour châu Mỹ', links: ['Du lịch Mỹ', 'Du lịch Canada'] },
      { title: 'Tour châu Úc', links: ['Du lịch Úc', 'Du lịch New Zealand'] },
      { title: 'Tour châu Phi', links: ['Du lịch Nam Phi'] },
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
          'Làm visa Myanmar',
          'Làm visa Indonesia',
          'Làm visa Ấn Độ',
          'Làm visa Hồng Kông',
          'Làm visa Singapore',
          'Làm visa Thái Lan',
          'Làm visa Campuchia',
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
      { title: 'Làm visa châu Mỹ', links: ['Làm visa Mỹ', 'Làm visa Canada'] },
      { title: 'Làm visa châu Úc', links: ['Làm visa Úc'] },
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
    { name: 'Pháp - Thụy Sỹ - Ý', tourCount: 50, imageUrl: '/hero/list-location/Phap-.svg' },
    { name: 'Bắc Âu', tourCount: 50, imageUrl: '/hero/list-location/BacAu.svg' },
    { name: 'Nhật Bản', tourCount: 50, imageUrl: '/hero/list-location/Nhatban.svg' },
    { name: 'Singapore', tourCount: 50, imageUrl: '/hero/list-location/Sing.svg' },
    { name: 'Phú Quốc', tourCount: 50, imageUrl: '/hero/list-location/PhuQuoc.svg' },
    { name: 'Hà Nội', tourCount: 50, imageUrl: '/hero/list-location/Hanoi.svg' },
  ];

  setActiveSidebarMenu(menuId: string | null): void {
    this.activeSidebarMenu.set(menuId);
  }

  selectDestination(destination: HomeHeroHotDestination): void {
    this.selectedDestination = destination;
    this.keyword = destination.name;
    this.destDropdownOpen = false;
  }

  increaseAdult(): void {
    this.adultCount++;
  }
  decreaseAdult(): void {
    if (this.adultCount > 0) this.adultCount--;
  }
  increaseChild(): void {
    this.childCount++;
  }
  decreaseChild(): void {
    if (this.childCount > 0) this.childCount--;
  }

  selectDepartureDate(day: TuiDay): void {
    this.departureDate = day;
    this.dateDropdownOpen = false;
  }

  clearDepartureDate(event: MouseEvent): void {
    event.stopPropagation();
    this.departureDate = null;
    this.dateDropdownOpen = false;
  }

  clearDestination(event: MouseEvent): void {
    event.stopPropagation();
    this.keyword = '';
    this.selectedDestination = null;
    this.destDropdownOpen = false;
  }

  clearGuests(event: MouseEvent): void {
    event.stopPropagation();
    this.adultCount = 0;
    this.childCount = 0;
    this.guestDropdownOpen = false;
  }

  submitSearch(): void {
    const queryParams = this.cleanQueryParams({
      keyword: this.keyword.trim() || this.selectedDestination?.name,
      departureLocation: this.departureLocation.trim(),
      people: this.totalPeople > 0 ? this.totalPeople : null,
      departureDate: this.departureDate?.toString('yyyy/mm/dd', '-'),
      page: 0,
      size: 12,
    });

    this.router.navigate(['/tours'], { queryParams });
  }

  private cleanQueryParams(
    params: Record<string, string | number | null | undefined>,
  ): Record<string, string | number> {
    return Object.entries(params).reduce<Record<string, string | number>>(
      (queryParams, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams[key] = value;
        }

        return queryParams;
      },
      {},
    );
  }
}
