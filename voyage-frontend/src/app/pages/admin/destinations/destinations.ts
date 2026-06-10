import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { catchError, of, take } from 'rxjs';

import { AdminDestinationApiService } from '../../../core/api/admin-destination-api.service';
import { VietnamProvinceApiService } from '../../../core/api/vietnam-province-api.service';
import {
  AdminDestination,
  AdminDestinationCreateRequest,
  AdminDestinationUpdateRequest,
  CountryOption,
  DestinationBatchActionResponse,
  DestinationNewData,
  DestinationRegion,
  DestinationStatus,
  DestinationSubRegion,
  ProvinceRegionMap,
  isDestinationDisplayEnabled,
} from '../../../core/models/destination.model';
import { AuthService } from '../../../core/auth/auth.service';
import { RoleCode } from '../../../core/models/user.model';
import { VietnamProvince } from '../../../core/models/vietnam-province.model';
import { AdminUiFeedbackService } from '../../../core/services/admin-ui-feedback.service';
import { AdminImageUpload } from '../shared/admin-image-upload/admin-image-upload';

type DestinationStatusFilter = 'ALL' | DestinationStatus;
type DestinationRegionFilter = 'ALL' | DestinationRegion;
type DestinationBatchAction = 'submit' | 'approve' | 'reject' | 'cancelApprove' | 'show' | 'hide';

interface FilterOption<T> {
  label: string;
  value: T;
}

type DestinationPendingFieldType = 'text' | 'image' | 'status' | 'display' | 'number';
type DestinationPendingDataKey = keyof DestinationNewData;

interface DestinationPendingComparisonRow {
  key: string;
  label: string;
  currentValue: string;
  pendingValue: string;
  changed: boolean;
  type: DestinationPendingFieldType;
  currentImageUrl: string;
  pendingImageUrl: string;
}

interface DestinationPendingReviewViewModel {
  destination: AdminDestination;
  title: string;
  slug: string;
  workflowLabel: string;
  workflowClassName: string;
  displayLabel: string;
  displayClassName: string;
  hasPendingData: boolean;
  parseError: string;
  rows: DestinationPendingComparisonRow[];
  canApproveReject: boolean;
  canCancelApprove: boolean;
}

interface DestinationNewDataParseResult {
  data: Partial<Record<DestinationPendingDataKey, unknown>> | null;
  errorMessage: string;
}

@Component({
  selector: 'app-admin-destinations',
  imports: [AdminImageUpload, NgClass, NgFor, NgIf, ReactiveFormsModule, RouterLink, TuiIcon],
  templateUrl: './destinations.html',
  styleUrl: './destinations.scss',
})
export class AdminDestinations implements OnInit {
  private readonly adminDestinationApiService = inject(AdminDestinationApiService);
  private readonly vietnamProvinceApiService = inject(VietnamProvinceApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly authService = inject(AuthService);

  readonly fallbackImage = '/hero/bg-home.png';
  readonly statusFilters: FilterOption<DestinationStatusFilter>[] = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Từ chối', value: 'REJECTED' },
    { label: 'Hủy trình duyệt', value: 'CANCEL_APPROVE' },
  ];
  readonly regionFilters: FilterOption<DestinationRegionFilter>[] = [
    { label: 'Tất cả khu vực', value: 'ALL' },
    { label: 'Trong nước', value: 'DOMESTIC' },
    { label: 'Quốc tế', value: 'INTERNATIONAL' },
  ];
  readonly regionOptions = [
    { label: 'Trong nước', value: 'DOMESTIC' },
    { label: 'Quốc tế', value: 'INTERNATIONAL' },
  ];
  readonly subRegionOptions: FilterOption<DestinationSubRegion>[] = [
    { label: 'Miền Bắc', value: 'NORTH' },
    { label: 'Miền Trung', value: 'CENTRAL' },
    { label: 'Miền Nam', value: 'SOUTH' },
  ];
  readonly provinceRegionMap: ProvinceRegionMap = {
    NORTH: [
      'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Ninh Bình', 'Lào Cai', 'Sơn La', 'Điện Biên', 'Lai Châu',
      'Cao Bằng', 'Lạng Sơn', 'Thái Nguyên', 'Tuyên Quang', 'Phú Thọ', 'Bắc Ninh', 'Hưng Yên',
    ],
    CENTRAL: [
      'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Trị', 'Huế', 'Đà Nẵng', 'Quảng Ngãi', 'Gia Lai',
      'Khánh Hòa', 'Lâm Đồng', 'Đắk Lắk',
    ],
    SOUTH: [
      'Hồ Chí Minh', 'Đồng Nai', 'Tây Ninh', 'Cần Thơ', 'An Giang', 'Đồng Tháp', 'Cà Mau', 'Vĩnh Long',
    ],
  };
  readonly fallbackCountries: CountryOption[] = [
    { name: { common: 'Thailand', official: 'Kingdom of Thailand' }, cca2: 'TH', flags: { svg: '', png: '' }, population: 0 },
    { name: { common: 'Singapore', official: 'Republic of Singapore' }, cca2: 'SG', flags: { svg: '', png: '' }, population: 0 },
    { name: { common: 'Japan', official: 'Japan' }, cca2: 'JP', flags: { svg: '', png: '' }, population: 0 },
    { name: { common: 'South Korea', official: 'Republic of Korea' }, cca2: 'KR', flags: { svg: '', png: '' }, population: 0 },
    { name: { common: 'China', official: "People's Republic of China" }, cca2: 'CN', flags: { svg: '', png: '' }, population: 0 },
    { name: { common: 'France', official: 'French Republic' }, cca2: 'FR', flags: { svg: '', png: '' }, population: 0 },
    { name: { common: 'United States', official: 'United States of America' }, cca2: 'US', flags: { svg: '', png: '' }, population: 0 },
  ];
  readonly fallbackInternationalCityMap: Record<string, string[]> = {
    Thailand: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
    Singapore: ['Singapore'],
    Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo'],
    'South Korea': ['Seoul', 'Busan', 'Jeju'],
    China: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
    France: ['Paris', 'Nice', 'Lyon'],
    'United States': ['New York', 'Los Angeles', 'San Francisco', 'Las Vegas'],
  };

  loading = false;
  saving = false;
  deletingId: number | null = null;
  updatingStatusId: number | null = null;
  updatingWorkflowId: number | null = null;
  updatingDisplayId: number | null = null;
  updatingImage = false;
  errorMessage = '';
  successMessage = '';
  destinations: AdminDestination[] = [];
  filteredDestinations: AdminDestination[] = [];
  vietnamProvinces: VietnamProvince[] = [];
  allCountryOptions: CountryOption[] = [];
  countryOptions: CountryOption[] = [];
  internationalCityOptions: string[] = [];
  filteredDomesticProvinces: VietnamProvince[] = [];
  filteredCountryOptions: CountryOption[] = [];
  filteredInternationalCityOptions: string[] = [];
  cityOptions: string[] = [];
  filteredCityOptions: string[] = [];
  provinceSearchKeyword = '';
  isProvinceDropdownOpen = false;
  activeProvinceIndex = -1;
  countrySearchKeyword = '';
  selectedCountryOriginalName = '';
  isCountryDropdownOpen = false;
  activeCountryIndex = -1;
  citySearchKeyword = '';
  selectedCityName = '';
  isCityDropdownOpen = false;
  loadingCities = false;
  cityApiErrorMessage: string | null = null;
  manualCityMode = false;
  activeCityIndex = -1;
  selectedProvince: VietnamProvince | null = null;
  selectedCountryOption: CountryOption | null = null;
  manualInternationalCityInput = false;
  destinationDataLoading = false;
  internationalCitiesLoading = false;
  destinationDataWarning = '';
  internationalCitiesWarning = '';
  keyword = '';
  statusFilter: DestinationStatusFilter = 'ALL';
  regionFilter: DestinationRegionFilter = 'ALL';
  selectedDestination: AdminDestination | null = null;
  isFormOpen = false;
  isEditMode = false;
  focusedSelect: 'statusFilter' | 'regionFilter' | 'subRegion' | 'formStatus' | null = null;
  pendingReview: DestinationPendingReviewViewModel | null = null;
  pendingRejectMode = false;
  pendingRejectReason = '';
  pendingReviewErrorMessage = '';
  pendingReviewSubmitting = false;
  selectedDestinationIds = new Set<number>();
  selectedBatchDestinations: AdminDestination[] = [];
  selectedBatchCount = 0;
  batchProcessing = false;
  batchRejectMode = false;
  batchRejectReason = '';
  batchErrorMessage = '';
  private slugManuallyEdited = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    region: ['DOMESTIC', [Validators.required]],
    subRegion: [''],
    country: ['Việt Nam', [Validators.required]],
    cityName: [''],
    countrySearch: [''],
    citySearch: [''],
    description: [''],
    imageUrl: [''],
    latitude: [''],
    longitude: [''],
    status: ['DRAFT' as DestinationStatus],
  });

  ngOnInit(): void {
    this.setupDestinationDataSelection();
    this.loadDestinationReferenceData();
    this.loadDestinations();
  }

  @HostListener('document:click', ['$event.target'])
  closeAutocompleteDropdownsOnOutsideClick(target: EventTarget | null): void {
    const element = target as HTMLElement | null;

    if (!element?.closest('.admin-destinations__autocomplete')) {
      this.closeAllAutocompleteDropdowns();
    }

    if (!element?.closest('.admin-destinations__control-wrap--select')) {
      this.focusedSelect = null;
    }
  }

  @HostListener('document:keydown.escape')
  closeAutocompleteDropdownsOnEscape(): void {
    this.closeAllAutocompleteDropdowns();
    this.focusedSelect = null;
  }

  loadDestinations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminDestinationApiService
      .getDestinations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.destinations = this.extractList(response).sort((a, b) => this.sortDestination(a, b));
          this.applyFilters();
          this.syncBatchSelection();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể tải danh sách điểm đến. Vui lòng thử lại sau.');
          this.loading = false;
        },
      });
  }

  loadDestinationReferenceData(): void {
    this.destinationDataLoading = true;
    this.destinationDataWarning = '';

    this.vietnamProvinceApiService
      .getProvinces()
      .pipe(
        catchError(() => {
          this.destinationDataWarning = 'Không thể tải danh sách tỉnh/thành Việt Nam. Form vẫn dùng dữ liệu nhập tay.';
          return of([] as VietnamProvince[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((provinces) => {
        this.vietnamProvinces = this.normalizeProvinces(provinces);
        this.filterDomesticProvinces();
        this.syncEditSelectionFromReferenceData();
        this.destinationDataLoading = false;
      });

    this.adminDestinationApiService
      .getCountries()
      .pipe(
        catchError(() => {
          this.destinationDataWarning = this.destinationDataWarning
            ? `${this.destinationDataWarning} Đang dùng danh sách quốc gia dự phòng.`
            : 'Không thể tải danh sách quốc gia quốc tế. Đang dùng danh sách dự phòng.';
          return of(this.fallbackCountries);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((countries) => {
        this.allCountryOptions = this.normalizeCountries(countries);
        this.countryOptions = this.allCountryOptions;
        this.filterCountryOptions();
        this.syncSelectedCountryOption();
      });
  }

  openCreateForm(): void {
    if (!this.canCreateDestination()) {
      this.denyDestinationAction();
      return;
    }

    this.isFormOpen = true;
    this.isEditMode = false;
    this.selectedDestination = null;
    this.slugManuallyEdited = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: '',
      slug: '',
      region: 'DOMESTIC',
      subRegion: '',
      country: 'Việt Nam',
      cityName: '',
      countrySearch: '',
      citySearch: '',
      description: '',
      imageUrl: '',
      latitude: '',
      longitude: '',
      status: 'DRAFT',
    }, { emitEvent: false });
    this.resetDestinationSelectionState();
    this.filterDomesticProvinces();
    this.filterCountryOptions();
  }

  openEditForm(destination: AdminDestination): void {
    if (!this.canEditDestination(destination)) {
      this.denyDestinationAction();
      return;
    }

    const region = this.resolveDestinationRegion(destination);
    const cityName = destination.name || '';
    const country = region === 'DOMESTIC' ? 'Việt Nam' : destination.country || '';
    const province = region === 'DOMESTIC' ? this.findProvinceForDestination(destination) : null;
    const subRegion = province ? this.getProvinceSubRegion(this.provinceDisplayName(province)) : this.getProvinceSubRegion(cityName);
    this.isFormOpen = true;
    this.isEditMode = true;
    this.selectedDestination = destination;
    this.resetDestinationSelectionState();
    this.selectedProvince = province;
    this.slugManuallyEdited = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset({
      name: cityName,
      slug: destination.slug || '',
      region,
      subRegion: region === 'DOMESTIC' ? subRegion || '' : '',
      country,
      cityName,
      countrySearch: region === 'INTERNATIONAL' ? country : '',
      citySearch: cityName,
      description: destination.description || '',
      imageUrl: destination.imageUrl || '',
      latitude: this.numberToInput(destination.latitude),
      longitude: this.numberToInput(destination.longitude),
      status: this.parseStatus(destination.status) || 'DRAFT',
    }, { emitEvent: false });
    this.manualInternationalCityInput = false;
    this.provinceSearchKeyword = region === 'DOMESTIC' ? cityName : '';
    this.countrySearchKeyword = region === 'INTERNATIONAL' ? country : '';
    this.citySearchKeyword = region === 'INTERNATIONAL' ? cityName : '';
    this.selectedCityName = region === 'INTERNATIONAL' ? cityName : '';
    this.filterDomesticProvinces();
    this.filterCountryOptions();
    this.filterCityOptions();
    this.syncSelectedCountryOption();
    if (region === 'INTERNATIONAL') {
      this.loadInternationalCitiesForSelectedCountry();
    }
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.isEditMode = false;
    this.selectedDestination = null;
    this.slugManuallyEdited = false;
    this.saving = false;
    this.updatingImage = false;
    this.form.reset({
      name: '',
      slug: '',
      region: 'DOMESTIC',
      subRegion: '',
      country: 'Việt Nam',
      cityName: '',
      countrySearch: '',
      citySearch: '',
      description: '',
      imageUrl: '',
      latitude: '',
      longitude: '',
      status: 'DRAFT',
    }, { emitEvent: false });
    this.resetDestinationSelectionState();
  }

  handleNameInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    const slug = this.generateSlug(this.form.controls.name.value);
    this.form.controls.slug.setValue(slug);
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  selectRegion(region: DestinationRegion): void {
    if (this.form.controls.region.value === region) {
      return;
    }

    this.form.controls.region.setValue(region);
  }

  closeFocusedSelect(event?: Event): void {
    this.focusedSelect = null;
    (event?.target as HTMLSelectElement | null)?.blur();
  }

  toggleSelect(selectName: 'statusFilter' | 'regionFilter' | 'subRegion' | 'formStatus'): void {
    this.focusedSelect = this.focusedSelect === selectName ? null : selectName;
  }

  selectSubRegion(subRegion: DestinationSubRegion | ''): void {
    this.form.controls.subRegion.setValue(subRegion);
    this.focusedSelect = null;
  }

  selectFormStatus(status: DestinationStatus): void {
    this.form.controls.status.setValue(status);
    this.focusedSelect = null;
  }

  selectStatusFilter(status: DestinationStatusFilter): void {
    this.statusFilter = status;
    this.focusedSelect = null;
    this.applyFilters();
  }

  selectRegionFilter(region: DestinationRegionFilter): void {
    this.regionFilter = region;
    this.focusedSelect = null;
    this.applyFilters();
  }

  statusFilterLabel(status: DestinationStatusFilter): string {
    return this.statusFilters.find((option) => option.value === status)?.label || 'Tất cả';
  }

  regionFilterLabel(region: DestinationRegionFilter): string {
    return this.regionFilters.find((option) => option.value === region)?.label || 'Tất cả khu vực';
  }

  subRegionLabel(subRegion?: string): string {
    return this.subRegionOptions.find((option) => option.value === subRegion)?.label || 'Chọn miền';
  }

  onProvinceInput(value: string): void {
    this.provinceSearchKeyword = value;
    this.activeProvinceIndex = -1;

    if (!this.selectedProvince || this.normalizeText(value) !== this.normalizeText(this.provinceDisplayName(this.selectedProvince))) {
      this.clearProvinceSelection(false);
      this.provinceSearchKeyword = value;
    }

    this.filterDomesticProvinces();
    this.isProvinceDropdownOpen = this.shouldShowProvincePicker();
  }

  handleProvinceInputMouseDown(event: MouseEvent): void {
    this.handleAutocompleteInputMouseDown(
      event,
      this.isProvinceDropdownOpen,
      () => this.openProvinceDropdown(),
      () => this.closeProvinceDropdown(),
    );
  }

  openProvinceDropdown(): void {
    if (!this.shouldShowProvincePicker()) {
      return;
    }

    this.closeCountryDropdown();
    this.closeCityDropdown();
    this.filterDomesticProvinces();
    this.isProvinceDropdownOpen = true;
  }

  closeProvinceDropdown(): void {
    this.isProvinceDropdownOpen = false;
    this.activeProvinceIndex = -1;
  }

  toggleProvinceDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isProvinceDropdownOpen) {
      this.closeProvinceDropdown();
      return;
    }

    this.openProvinceDropdown();
  }

  selectProvince(province: VietnamProvince): void {
    const cityName = this.provinceDisplayName(province);
    this.selectedProvince = province;
    this.provinceSearchKeyword = cityName;
    this.setDestinationName(cityName);
    this.form.patchValue({
      cityName,
      citySearch: cityName,
      country: 'Việt Nam',
    }, { emitEvent: false });
    this.closeProvinceDropdown();
    this.filterDomesticProvinces();
  }

  clearProvinceSelection(clearKeyword = true): void {
    this.selectedProvince = null;
    this.activeProvinceIndex = -1;

    if (clearKeyword) {
      this.provinceSearchKeyword = '';
    }

    this.form.patchValue({
      cityName: '',
      citySearch: clearKeyword ? '' : this.provinceSearchKeyword,
      name: '',
      slug: '',
      country: 'Việt Nam',
    }, { emitEvent: false });
  }

  onProvinceKeydown(event: KeyboardEvent): void {
    this.handleAutocompleteKeydown(
      event,
      this.filteredDomesticProvinces.length,
      this.activeProvinceIndex,
      (index) => this.activeProvinceIndex = index,
      () => this.openProvinceDropdown(),
      () => this.closeProvinceDropdown(),
      (index) => this.selectProvince(this.filteredDomesticProvinces[index]),
    );
  }

  onCountryInput(value: string): void {
    this.countrySearchKeyword = value;
    this.activeCountryIndex = -1;

    if (!this.selectedCountryOption || this.normalizeText(value) !== this.normalizeText(this.countryOptionLabel(this.selectedCountryOption))) {
      this.clearCountrySelection(false);
      this.countrySearchKeyword = value;
    }

    this.filterCountryOptions();
    this.isCountryDropdownOpen = this.isInternationalForm();
  }

  handleCountryInputMouseDown(event: MouseEvent): void {
    this.handleAutocompleteInputMouseDown(
      event,
      this.isCountryDropdownOpen,
      () => this.openCountryDropdown(),
      () => this.closeCountryDropdown(),
    );
  }

  openCountryDropdown(): void {
    if (!this.isInternationalForm()) {
      return;
    }

    this.closeProvinceDropdown();
    this.closeCityDropdown();
    this.filterCountryOptions();
    this.isCountryDropdownOpen = true;
  }

  closeCountryDropdown(): void {
    this.isCountryDropdownOpen = false;
    this.activeCountryIndex = -1;
  }

  toggleCountryDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isCountryDropdownOpen) {
      this.closeCountryDropdown();
      return;
    }

    this.openCountryDropdown();
  }

  selectCountry(country: CountryOption): void {
    const countryName = this.countryOptionLabel(country);
    this.selectedCountryOption = country;
    this.selectedCountryOriginalName = country.name.common || countryName;
    this.countrySearchKeyword = countryName;
    this.manualInternationalCityInput = false;
    this.form.patchValue({
      country: countryName,
      countrySearch: countryName,
      cityName: '',
      citySearch: '',
      name: '',
      slug: '',
    }, { emitEvent: false });
    this.resetCitySelection();
    this.closeCountryDropdown();
    this.loadInternationalCitiesForSelectedCountry();
  }

  clearCountrySelection(clearKeyword = true): void {
    this.selectedCountryOption = null;
    this.selectedCountryOriginalName = '';
    this.activeCountryIndex = -1;
    this.internationalCityOptions = [];
    this.filteredInternationalCityOptions = [];
    this.cityOptions = [];
    this.filteredCityOptions = [];

    if (clearKeyword) {
      this.countrySearchKeyword = '';
    }

    this.form.patchValue({
      country: '',
      countrySearch: clearKeyword ? '' : this.countrySearchKeyword,
      cityName: '',
      citySearch: '',
      name: '',
      slug: '',
    }, { emitEvent: false });
    this.resetCitySelection();
  }

  onCountryKeydown(event: KeyboardEvent): void {
    this.handleAutocompleteKeydown(
      event,
      this.filteredCountryOptions.length,
      this.activeCountryIndex,
      (index) => this.activeCountryIndex = index,
      () => this.openCountryDropdown(),
      () => this.closeCountryDropdown(),
      (index) => this.selectCountry(this.filteredCountryOptions[index]),
    );
  }

  onCityInput(value: string): void {
    this.citySearchKeyword = value;
    this.activeCityIndex = -1;

    if (!this.selectedCityName || this.normalizeText(value) !== this.normalizeText(this.selectedCityName)) {
      this.selectedCityName = '';
      this.form.patchValue({
        cityName: '',
        citySearch: value,
        name: '',
        slug: '',
      }, { emitEvent: false });
    }

    this.filterCityOptions();
    this.isCityDropdownOpen = this.shouldShowInternationalCityPicker();
  }

  handleCityInputMouseDown(event: MouseEvent): void {
    this.handleAutocompleteInputMouseDown(
      event,
      this.isCityDropdownOpen,
      () => this.openCityDropdown(),
      () => this.closeCityDropdown(),
    );
  }

  openCityDropdown(): void {
    if (!this.shouldShowInternationalCityPicker()) {
      return;
    }

    this.filterCityOptions();
    this.closeProvinceDropdown();
    this.closeCountryDropdown();
    this.isCityDropdownOpen = true;
  }

  closeCityDropdown(): void {
    this.isCityDropdownOpen = false;
    this.activeCityIndex = -1;
  }

  toggleCityDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isCityDropdownOpen) {
      this.closeCityDropdown();
      return;
    }

    this.openCityDropdown();
  }

  closeAllAutocompleteDropdowns(): void {
    this.closeProvinceDropdown();
    this.closeCountryDropdown();
    this.closeCityDropdown();
  }

  filterCityOptions(): void {
    const keyword = this.normalizeText(this.citySearchKeyword);

    this.filteredCityOptions = this.cityOptions
      .filter((city) => !keyword || this.normalizeText(city).includes(keyword))
      .slice(0, 120);
    this.filteredInternationalCityOptions = this.filteredCityOptions;
    this.activeCityIndex = -1;
  }

  selectCity(cityName: string): void {
    this.selectedCityName = cityName;
    this.citySearchKeyword = cityName;
    this.setDestinationName(cityName);
    this.form.patchValue({
      cityName,
      citySearch: cityName,
    }, { emitEvent: false });
    this.closeCityDropdown();
  }

  selectInternationalCity(cityName: string): void {
    this.selectCity(cityName);
  }

  handleManualCityInput(event: Event): void {
    const cityName = (event.target as HTMLInputElement).value;
    this.onCityInput(cityName);
  }

  commitManualCity(): void {
    const cityName = this.citySearchKeyword.trim();

    if (!this.isInternationalForm()) {
      return;
    }

    if (!cityName) {
      this.resetCitySelection();
      return;
    }

    if (this.form.controls.cityName.value !== cityName) {
      this.selectCity(cityName);
    } else {
      this.closeCityDropdown();
    }
  }

  resetCitySelection(): void {
    this.citySearchKeyword = '';
    this.selectedCityName = '';
    this.filteredCityOptions = [];
    this.filteredInternationalCityOptions = [];
    this.isCityDropdownOpen = false;
    this.activeCityIndex = -1;
    this.form.patchValue({
      cityName: '',
      citySearch: '',
      name: '',
      slug: '',
    }, { emitEvent: false });
  }

  handleCityKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.isCityDropdownOpen && this.activeCityIndex >= 0) {
        this.selectCity(this.filteredCityOptions[this.activeCityIndex]);
      } else {
        this.commitManualCity();
      }
      return;
    }

    if (event.key === 'Tab') {
      this.commitManualCity();
      this.closeCityDropdown();
      return;
    }

    if (event.key === 'Escape') {
      this.closeCityDropdown();
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    if (!this.filteredCityOptions.length) {
      return;
    }

    event.preventDefault();
    this.isCityDropdownOpen = true;
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    this.activeCityIndex = (this.activeCityIndex + direction + this.filteredCityOptions.length) % this.filteredCityOptions.length;
  }

  private handleAutocompleteKeydown(
    event: KeyboardEvent,
    optionCount: number,
    activeIndex: number,
    setActiveIndex: (index: number) => void,
    openDropdown: () => void,
    closeDropdown: () => void,
    selectOption: (index: number) => void,
  ): void {
    if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault();
        selectOption(activeIndex);
      }
      return;
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      closeDropdown();
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    if (!optionCount) {
      return;
    }

    event.preventDefault();
    openDropdown();
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    setActiveIndex((activeIndex + direction + optionCount) % optionCount);
  }

  private handleAutocompleteInputMouseDown(
    event: MouseEvent,
    isOpen: boolean,
    openDropdown: () => void,
    closeDropdown: () => void,
  ): void {
    if (isOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeDropdown();
      return;
    }

    if (document.activeElement === event.currentTarget) {
      event.preventDefault();
      event.stopPropagation();
      openDropdown();
    }
  }

  isDomesticForm(): boolean {
    return this.form.controls.region.value === 'DOMESTIC';
  }

  isInternationalForm(): boolean {
    return this.form.controls.region.value === 'INTERNATIONAL';
  }

  shouldShowProvincePicker(): boolean {
    return this.isDomesticForm() && !!this.form.controls.subRegion.value;
  }

  shouldShowInternationalCityPicker(): boolean {
    return this.isInternationalForm() && !!this.form.controls.country.value.trim();
  }

  shouldUseManualInternationalCityInput(): boolean {
    return this.shouldShowInternationalCityPicker()
      && !this.internationalCitiesLoading
      && (this.manualInternationalCityInput || this.internationalCityOptions.length === 0);
  }

  selectedCountryFlag(): string {
    return this.selectedCountryOption?.flags?.svg || this.selectedCountryOption?.flags?.png || '';
  }

  provinceDisplayName(province: VietnamProvince): string {
    return province.displayName || province.name;
  }

  isProvinceSelected(province: VietnamProvince): boolean {
    if (!this.selectedProvince) {
      return false;
    }

    return this.normalizeText(this.provinceDisplayName(this.selectedProvince)) === this.normalizeText(this.provinceDisplayName(province));
  }

  updateKeyword(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  updateStatusFilter(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as DestinationStatusFilter;
    this.closeFocusedSelect(event);
    this.applyFilters();
  }

  updateRegionFilter(event: Event): void {
    this.regionFilter = (event.target as HTMLSelectElement).value as DestinationRegionFilter;
    this.closeFocusedSelect(event);
    this.applyFilters();
  }

  submitForm(): void {
    if (this.isInternationalForm()) {
      this.commitManualCity();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && !this.selectedDestination?.id) {
      this.errorMessage = 'Không xác định được điểm đến cần cập nhật.';
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = this.isEditMode && this.selectedDestination?.id
      ? this.adminDestinationApiService.updateDestination(this.selectedDestination.id, payload as AdminDestinationUpdateRequest)
      : this.adminDestinationApiService.createDestination(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const savedDestination = this.extractItem(response);
          this.successMessage = this.isEditMode ? 'Đã cập nhật điểm đến.' : 'Đã tạo điểm đến mới.';
          this.saving = false;

          if (savedDestination?.id) {
            this.upsertDestination(savedDestination);
          } else {
            this.loadDestinations();
          }

          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể lưu điểm đến. Vui lòng thử lại sau.');
          this.saving = false;
        },
      });
  }

  updateImageOnly(): void {
    const destinationId = this.selectedDestination?.id;

    if (!this.isEditMode || !destinationId) {
      return;
    }

    const imageUrl = this.form.controls.imageUrl.value.trim();

    if (!imageUrl) {
      this.errorMessage = 'Vui lòng nhập URL ảnh Cloudinary trước khi cập nhật ảnh.';
      return;
    }

    this.updatingImage = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminDestinationApiService
      .updateDestinationImage(destinationId, imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const fallbackDestination: AdminDestination = {
            ...(this.selectedDestination || {}),
            id: destinationId,
            imageUrl,
          };
          const updatedDestination = this.extractItem(response) || fallbackDestination;
          this.upsertDestination(updatedDestination);
          this.selectedDestination = updatedDestination;
          this.successMessage = 'Đã cập nhật ảnh điểm đến.';
          this.updatingImage = false;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật ảnh điểm đến. Vui lòng thử lại sau.');
          this.updatingImage = false;
        },
      });
  }

  submitWorkflow(destination: AdminDestination): void {
    this.runWorkflowAction(destination, 'submit');
  }

  approveWorkflow(destination: AdminDestination): void {
    this.runWorkflowAction(destination, 'approve');
  }

  rejectWorkflow(destination: AdminDestination, reason?: string | null): void {
    this.runWorkflowAction(destination, 'reject', reason);
  }

  cancelApproveWorkflow(destination: AdminDestination): void {
    this.runWorkflowAction(destination, 'cancelApprove');
  }

  updateDisplay(destination: AdminDestination, isDisplay: 0 | 1): void {
    if (!destination.id || this.updatingDisplayId) {
      return;
    }

    this.updatingDisplayId = destination.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminDestinationApiService
      .updateDestinationDisplay(destination.id, isDisplay)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedDestination = this.extractItem(response) || { ...destination, isDisplay };
          this.upsertDestination(updatedDestination);
          this.successMessage = isDisplay === 1 ? 'Đã bật hiển thị public.' : 'Đã ẩn khỏi public.';
          this.feedback.success(this.successMessage);
          this.updatingDisplayId = null;
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật hiển thị điểm đến. Vui lòng thử lại sau.');
          this.feedback.error(this.errorMessage);
          this.updatingDisplayId = null;
        },
      });
  }

  private runWorkflowAction(destination: AdminDestination, action: DestinationBatchAction, reason?: string | null): void {
    if (!destination.id || this.updatingWorkflowId) {
      return;
    }

    this.updatingWorkflowId = destination.id;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = action === 'submit'
      ? this.adminDestinationApiService.submitDestination(destination.id)
      : action === 'approve'
        ? this.adminDestinationApiService.approveDestination(destination.id)
        : action === 'reject'
          ? this.adminDestinationApiService.rejectDestination(destination.id, { reason: reason || null })
          : this.adminDestinationApiService.cancelApproveDestination(destination.id);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const updatedDestination = this.extractItem(response);
          if (updatedDestination?.id) {
            this.upsertDestination(updatedDestination);
            if (this.pendingReview?.destination.id === updatedDestination.id) {
              this.pendingReview = this.buildPendingReview(updatedDestination);
            }
          } else {
            this.loadDestinations();
          }
          this.successMessage = this.workflowSuccessMessage(action);
          this.feedback.success(this.successMessage);
          this.updatingWorkflowId = null;
          this.pendingReviewSubmitting = false;
          this.pendingRejectMode = false;
          this.pendingRejectReason = '';
        },
        error: (error) => {
          this.errorMessage = this.errorText(error, 'Không thể cập nhật workflow điểm đến. Vui lòng thử lại sau.');
          this.feedback.error(this.errorMessage);
          this.updatingWorkflowId = null;
          this.pendingReviewSubmitting = false;
        },
      });
  }

  deleteDestination(destination: AdminDestination): void {
    if (!destination.id || this.deletingId) {
      return;
    }

    if (!this.canDeleteDestination()) {
      this.denyDestinationAction();
      return;
    }

    this.feedback
      .confirmDanger(
        'Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c. B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u0111i\u1ec3m \u0111\u1ebfn n\u00e0y? N\u1ebfu \u0111i\u1ec3m \u0111\u1ebfn \u0111ang \u0111\u01b0\u1ee3c tour s\u1eed d\u1ee5ng, backend c\u00f3 th\u1ec3 t\u1eeb ch\u1ed1i x\u00f3a.',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed || !destination.id) {
          return;
        }

        this.deletingId = destination.id;
        this.errorMessage = '';
        this.successMessage = '';

        this.adminDestinationApiService
          .deleteDestination(destination.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.destinations = this.destinations.filter((item) => item.id !== destination.id);
              if (destination.id) {
                this.selectedDestinationIds.delete(destination.id);
              }
              this.applyFilters();
              this.syncBatchSelection();
              this.successMessage = '\u0110\u00e3 x\u00f3a \u0111i\u1ec3m \u0111\u1ebfn.';
              this.feedback.success(this.successMessage);
              this.deletingId = null;

              if (this.selectedDestination?.id === destination.id) {
                this.closeForm();
              }
            },
            error: (error) => {
              this.errorMessage = this.errorText(error, 'Kh\u00f4ng th\u1ec3 x\u00f3a \u0111i\u1ec3m \u0111\u1ebfn. Vui l\u00f2ng th\u1eed l\u1ea1i sau.');
              this.feedback.error(this.errorMessage);
              this.deletingId = null;
            },
          });
      });
  }

  applyFilters(): void {
    const keyword = this.normalizeText(this.keyword.trim());

    this.filteredDestinations = this.destinations.filter((destination) => {
      const haystack = [destination.name, destination.slug, destination.country, destination.region]
        .map((value) => this.normalizeText(value || ''));
      const matchesKeyword = !keyword || haystack.some((value) => value.includes(keyword));
      const status = this.parseStatus(destination.status);
      const matchesStatus = this.statusFilter === 'ALL' || status === this.statusFilter;
      const matchesRegion = this.matchesRegionFilter(destination);

      return matchesKeyword && matchesStatus && matchesRegion;
    });
  }

  imagePreviewUrl(): string {
    return this.form.controls.imageUrl.value.trim();
  }

  getDestinationImage(destination: AdminDestination): string {
    return destination.imageUrl || this.fallbackImage;
  }

  coordinatesText(destination: AdminDestination): string {
    const latitude = this.parseNumber(destination.latitude);
    const longitude = this.parseNumber(destination.longitude);

    if (latitude === undefined || longitude === undefined) {
      return 'Chưa có tọa độ';
    }

    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  statusLabel(status?: string): string {
    return this.workflowLabel(status);
  }

  statusClass(status?: string): string {
    return this.workflowClass(status);
  }

  nextStatusLabel(destination: AdminDestination): string {
    return this.isDisplayEnabled(destination) ? 'Ẩn public' : 'Hiển thị public';
  }

  workflowLabel(status?: string): string {
    switch (this.parseStatus(status)) {
      case 'DRAFT':
        return 'Nháp';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'CANCEL_APPROVE':
        return 'Hủy trình duyệt';
      default:
        return 'Chưa xác định';
    }
  }

  workflowClass(status?: string): string {
    return `admin-destinations__status--${(this.parseStatus(status) || 'draft').toLowerCase().replace('_', '-')}`;
  }

  displayLabel(destination: AdminDestination): string {
    if (this.parseStatus(destination.status) !== 'APPROVED') {
      return 'Chưa thể hiển thị';
    }

    return this.isDisplayEnabled(destination) ? 'Đang hiển thị' : 'Đang ẩn';
  }

  displayClass(destination: AdminDestination): string {
    if (this.parseStatus(destination.status) !== 'APPROVED') {
      return 'admin-destinations__display--blocked';
    }

    return this.isDisplayEnabled(destination) ? 'admin-destinations__display--shown' : 'admin-destinations__display--hidden';
  }

  pendingDataLabel(destination: AdminDestination): string {
    return this.hasPendingData(destination) ? 'Có dữ liệu chờ duyệt' : 'Không có';
  }

  pendingDataClass(destination: AdminDestination): string {
    return this.hasPendingData(destination) ? 'admin-destinations__pending--yes' : 'admin-destinations__pending--no';
  }

  isDisplayEnabled(destination: AdminDestination): boolean {
    return isDestinationDisplayEnabled(destination.isDisplay);
  }

  hasPendingData(destination: AdminDestination): boolean {
    return typeof destination.newData === 'string' && destination.newData.trim().length > 0;
  }

  canCreateDestination(): boolean {
    return this.hasAnyRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  canEditDestination(destination: AdminDestination): boolean {
    return this.hasAnyRole('STAFF', 'ADMIN', 'SUPER_ADMIN') && this.parseStatus(destination.status) !== 'PENDING';
  }

  canSubmitDestination(destination: AdminDestination): boolean {
    const status = this.parseStatus(destination.status);
    return this.hasAnyRole('STAFF', 'ADMIN', 'SUPER_ADMIN') && (status === 'DRAFT' || status === 'REJECTED' || status === 'CANCEL_APPROVE');
  }

  canApproveDestination(destination: AdminDestination): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.parseStatus(destination.status) === 'PENDING';
  }

  canRejectDestination(destination: AdminDestination): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.parseStatus(destination.status) === 'PENDING';
  }

  canCancelApproveDestination(destination: AdminDestination): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.parseStatus(destination.status) === 'PENDING';
  }

  canUpdateDisplay(destination: AdminDestination): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.parseStatus(destination.status) === 'APPROVED';
  }

  canDeleteDestination(): boolean {
    return this.hasAnyRole('SUPER_ADMIN');
  }

  canOpenFullMediaLibrary(): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN');
  }

  canUseBatchWorkflow(): boolean {
    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN');
  }

  formatRegion(value?: string): string {
    if (value === 'DOMESTIC') {
      return 'Trong nước';
    }

    if (value === 'INTERNATIONAL') {
      return 'Quốc tế';
    }

    return value || 'Chưa phân vùng';
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Đang cập nhật';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  openPendingReview(destination: AdminDestination): void {
    this.pendingReview = this.buildPendingReview(destination);
    this.pendingRejectMode = false;
    this.pendingRejectReason = destination.rejectReason || '';
    this.pendingReviewErrorMessage = '';
  }

  closePendingReview(): void {
    this.pendingReview = null;
    this.pendingRejectMode = false;
    this.pendingRejectReason = '';
    this.pendingReviewErrorMessage = '';
    this.pendingReviewSubmitting = false;
  }

  approvePendingReview(): void {
    const destination = this.pendingReview?.destination;
    if (!destination) {
      return;
    }

    this.pendingReviewSubmitting = true;
    this.approveWorkflow(destination);
  }

  startRejectPendingReview(): void {
    this.pendingRejectMode = true;
    this.pendingReviewErrorMessage = '';
  }

  cancelRejectPendingReview(): void {
    this.pendingRejectMode = false;
    this.pendingRejectReason = this.pendingReview?.destination.rejectReason || '';
  }

  confirmRejectPendingReview(): void {
    const destination = this.pendingReview?.destination;
    if (!destination) {
      return;
    }

    this.pendingReviewSubmitting = true;
    this.rejectWorkflow(destination, this.pendingRejectReason);
  }

  cancelApprovePendingReview(): void {
    const destination = this.pendingReview?.destination;
    if (!destination) {
      return;
    }

    this.pendingReviewSubmitting = true;
    this.cancelApproveWorkflow(destination);
  }

  updatePendingRejectReason(event: Event): void {
    this.pendingRejectReason = (event.target as HTMLTextAreaElement).value;
  }

  updateBatchRejectReason(event: Event): void {
    this.batchRejectReason = (event.target as HTMLTextAreaElement).value;
  }

  toggleDestinationSelection(destination: AdminDestination, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = destination.id;

    if (!id) {
      return;
    }

    if (checked) {
      this.selectedDestinationIds.add(id);
    } else {
      this.selectedDestinationIds.delete(id);
    }

    this.syncBatchSelection();
  }

  isDestinationSelected(destination: AdminDestination): boolean {
    return !!destination.id && this.selectedDestinationIds.has(destination.id);
  }

  clearBatchSelection(): void {
    this.selectedDestinationIds.clear();
    this.syncBatchSelection();
  }

  runBatchAction(action: DestinationBatchAction): void {
    if (!this.selectedBatchCount || this.batchProcessing) {
      return;
    }

    if (action === 'reject' && !this.batchRejectMode) {
      this.batchRejectMode = true;
      return;
    }

    const ids = this.selectedBatchDestinations.map((destination) => destination.id).filter((id): id is number => !!id);
    this.batchProcessing = true;
    this.batchErrorMessage = '';

    const request$ = action === 'submit'
      ? this.adminDestinationApiService.submitDestinations(ids)
      : action === 'approve'
        ? this.adminDestinationApiService.approveDestinations(ids)
        : action === 'reject'
          ? this.adminDestinationApiService.rejectDestinations(ids, this.batchRejectReason)
          : action === 'cancelApprove'
            ? this.adminDestinationApiService.cancelApproveDestinations(ids)
            : action === 'show'
              ? this.adminDestinationApiService.updateDestinationsDisplay(ids, 1)
              : this.adminDestinationApiService.updateDestinationsDisplay(ids, 0);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const result = this.extractBatchActionResponse(response) || this.fallbackBatchResponse(ids.length);
          this.batchProcessing = false;
          this.batchRejectMode = false;
          this.batchRejectReason = '';
          this.clearBatchSelection();
          this.loadDestinations();
          this.successMessage = `${this.batchSuccessVerb(action)} ${result.successCount}/${result.total} điểm đến.`;
          if (result.failedCount > 0) {
            this.batchErrorMessage = `${result.failedCount} điểm đến lỗi. ${result.failedItems.map((item) => item.message).filter(Boolean).join('; ')}`;
            this.feedback.warning(this.batchErrorMessage);
          } else {
            this.feedback.success(this.successMessage);
          }
        },
        error: (error) => {
          this.batchProcessing = false;
          this.batchErrorMessage = this.errorText(error, 'Không thể xử lý batch điểm đến.');
          this.feedback.error(this.batchErrorMessage);
        },
      });
  }

  cancelBatchReject(): void {
    this.batchRejectMode = false;
    this.batchRejectReason = '';
  }

  canRunBatchAction(action: DestinationBatchAction): boolean {
    if (!this.selectedBatchCount) {
      return false;
    }

    if (action === 'submit') {
      return this.selectedBatchDestinations.some((destination) => this.canSubmitDestination(destination));
    }

    if (action === 'approve') {
      return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.selectedBatchDestinations.some((destination) => this.canApproveDestination(destination));
    }

    if (action === 'reject') {
      return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.selectedBatchDestinations.some((destination) => this.canRejectDestination(destination));
    }

    if (action === 'cancelApprove') {
      return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.selectedBatchDestinations.some((destination) => this.canCancelApproveDestination(destination));
    }

    if (action === 'show') {
      return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.selectedBatchDestinations.some((destination) => this.canUpdateDisplay(destination) && !this.isDisplayEnabled(destination));
    }

    return this.hasAnyRole('ADMIN', 'SUPER_ADMIN') && this.selectedBatchDestinations.some((destination) => this.canUpdateDisplay(destination) && this.isDisplayEnabled(destination));
  }

  getProvinceSubRegion(provinceName: string): DestinationSubRegion | null {
    const normalizedProvince = this.normalizeText(provinceName);
    const subRegions: DestinationSubRegion[] = ['NORTH', 'CENTRAL', 'SOUTH'];

    return subRegions.find((subRegion) =>
      this.provinceRegionMap[subRegion].some((name) => this.normalizeText(name) === normalizedProvince),
    ) || null;
  }

  countryOptionLabel(country: CountryOption): string {
    return this.getVietnameseCountryName(country);
  }

  private setupDestinationDataSelection(): void {
    this.form.controls.region.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((region) => this.applyRegionDefaults(region as DestinationRegion));

    this.form.controls.subRegion.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.handleSubRegionSelectionChange());
  }

  private applyRegionDefaults(region: DestinationRegion): void {
    if (region === 'DOMESTIC') {
      this.internationalCityOptions = [];
      this.filteredInternationalCityOptions = [];
      this.cityOptions = [];
      this.filteredCityOptions = [];
      this.internationalCitiesWarning = '';
      this.manualInternationalCityInput = false;
      this.manualCityMode = false;
      this.cityApiErrorMessage = null;
      this.selectedProvince = null;
      this.selectedCountryOption = null;
      this.selectedCountryOriginalName = '';
      this.provinceSearchKeyword = '';
      this.countrySearchKeyword = '';
      this.closeAllAutocompleteDropdowns();
      this.form.patchValue({
        subRegion: '',
        country: 'Việt Nam',
        cityName: '',
        countrySearch: '',
        citySearch: '',
        name: '',
        slug: '',
      }, { emitEvent: false });
      this.filterDomesticProvinces();
      return;
    }

    this.form.patchValue({
      subRegion: '',
      country: '',
      cityName: '',
      countrySearch: '',
      citySearch: '',
      name: '',
      slug: '',
    }, { emitEvent: false });
    this.filteredDomesticProvinces = [];
    this.selectedProvince = null;
    this.provinceSearchKeyword = '';
    this.countrySearchKeyword = '';
    this.selectedCountryOption = null;
    this.selectedCountryOriginalName = '';
    this.closeAllAutocompleteDropdowns();
    this.resetCitySelection();
    this.filterCountryOptions();
  }

  private handleSubRegionSelectionChange(): void {
    if (!this.isDomesticForm()) {
      return;
    }

    this.selectedProvince = null;
    this.provinceSearchKeyword = '';
    this.closeProvinceDropdown();
    this.form.patchValue({
      cityName: '',
      citySearch: '',
      name: '',
      slug: '',
      country: 'Việt Nam',
    }, { emitEvent: false });
    this.filterDomesticProvinces();
  }

  private loadInternationalCitiesForSelectedCountry(): void {
    if (this.form.controls.region.value !== 'INTERNATIONAL') {
      return;
    }

    const country = this.selectedCountryOriginalName || this.selectedCountryOption?.name?.common || this.form.controls.country.value.trim();

    if (!country) {
      this.internationalCityOptions = [];
      this.filteredInternationalCityOptions = [];
      this.cityOptions = [];
      this.filteredCityOptions = [];
      this.internationalCitiesWarning = '';
      this.cityApiErrorMessage = null;
      this.loadingCities = false;
      this.manualCityMode = false;
      return;
    }

    this.internationalCitiesLoading = true;
    this.loadingCities = true;
    this.internationalCitiesWarning = '';
    this.cityApiErrorMessage = null;
    this.manualInternationalCityInput = false;
    this.manualCityMode = false;

    this.adminDestinationApiService
      .getCitiesByCountry(country)
      .pipe(
        catchError(() => {
          this.cityApiErrorMessage = 'Không tải được danh sách thành phố, bạn có thể nhập thủ công.';
          this.internationalCitiesWarning = this.cityApiErrorMessage;
          const fallbackCities = this.fallbackInternationalCityMap[country] || [];
          this.manualInternationalCityInput = false;
          this.manualCityMode = fallbackCities.length === 0;
          return of({ data: fallbackCities });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.internationalCityOptions = this.normalizeCityOptions(response.data || []);
        this.cityOptions = this.internationalCityOptions;
        this.manualInternationalCityInput = false;
        this.manualCityMode = this.cityOptions.length === 0;
        if (this.manualCityMode && !this.cityApiErrorMessage) {
          this.cityApiErrorMessage = 'Không tải được danh sách thành phố, bạn có thể nhập thủ công.';
          this.internationalCitiesWarning = this.cityApiErrorMessage;
        }
        this.filterCityOptions();
        this.internationalCitiesLoading = false;
        this.loadingCities = false;
      });
  }

  private normalizeProvinces(provinces: VietnamProvince[]): VietnamProvince[] {
    return provinces
      .filter((province) => !!province?.name)
      .map((province) => ({
        ...province,
        displayName: province.displayName || this.shortProvinceName(province.name),
        divisionType: province.divisionType || province.division_type,
      }))
      .sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name, 'vi'));
  }

  private normalizeCountries(countries: CountryOption[]): CountryOption[] {
    return countries
      .filter((country) => !!country?.name?.common)
      .sort((a, b) => this.countryOptionLabel(a).localeCompare(this.countryOptionLabel(b), 'vi'));
  }

  private getVietnameseCountryName(country: CountryOption): string {
    const fromApi = country.translations?.['vie']?.common;

    if (fromApi) {
      return fromApi;
    }

    if (country.cca2) {
      const displayNames = new Intl.DisplayNames(['vi'], { type: 'region' });
      return displayNames.of(country.cca2) || country.name?.common || '';
    }

    return country.name?.common || '';
  }

  private normalizeCityOptions(cities: string[]): string[] {
    return Array.from(new Set(cities.map((city) => city.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'vi'));
  }

  private shortProvinceName(name: string): string {
    return name
      .replace(/^Thành phố\s+/i, '')
      .replace(/^Tỉnh\s+/i, '')
      .trim();
  }

  private setDestinationName(name: string): void {
    const normalizedName = name.trim();
    this.form.patchValue({
      name: normalizedName,
      slug: this.generateSlug(normalizedName),
    }, { emitEvent: false });
    this.slugManuallyEdited = false;
  }

  private filterDomesticProvinces(): void {
    const subRegion = this.form.controls.subRegion.value as DestinationSubRegion | '';
    const keyword = this.normalizeText(this.provinceSearchKeyword);

    if (!subRegion) {
      this.filteredDomesticProvinces = [];
      return;
    }

    const allowedNames = new Set(this.provinceRegionMap[subRegion].map((name) => this.normalizeText(name)));

    this.filteredDomesticProvinces = this.vietnamProvinces.filter((province) => {
      const displayName = this.provinceDisplayName(province);
      const normalizedDisplayName = this.normalizeText(displayName);
      const normalizedRawName = this.normalizeText(province.name);
      const matchesRegion = allowedNames.has(normalizedDisplayName) || allowedNames.has(normalizedRawName);
      const matchesKeyword = !keyword
        || normalizedDisplayName.includes(keyword)
        || normalizedRawName.includes(keyword);

      return matchesRegion && matchesKeyword;
    });
  }

  private filterCountryOptions(): void {
    const keyword = this.normalizeText(this.countrySearchKeyword);

    this.filteredCountryOptions = this.allCountryOptions
      .filter((country) => {
        const vietnamese = this.normalizeText(this.countryOptionLabel(country));
        const common = this.normalizeText(country.name.common || '');
        const official = this.normalizeText(country.name.official || '');
        const code = this.normalizeText(country.cca2 || '');

        return !keyword || vietnamese.includes(keyword) || common.includes(keyword) || official.includes(keyword) || code.includes(keyword);
      })
      .slice(0, 80);
  }

  private findCountryOption(countryName: string): CountryOption | null {
    const normalizedCountryName = this.normalizeText(countryName);

    return this.countryOptions.find((country) =>
      this.normalizeText(this.countryOptionLabel(country)) === normalizedCountryName
      || this.normalizeText(country.name.common || '') === normalizedCountryName
      || this.normalizeText(country.name.official || '') === normalizedCountryName,
    ) || null;
  }

  private filterInternationalCityOptions(): void {
    this.filterCityOptions();
  }

  private syncSelectedCountryOption(): void {
    const selectedCountry = this.form.controls.country.value.trim();

    this.selectedCountryOption = this.countryOptions.find((country) =>
      this.normalizeText(this.countryOptionLabel(country)) === this.normalizeText(selectedCountry)
      || this.normalizeText(country.name.common || '') === this.normalizeText(selectedCountry),
    ) || null;

    if (this.selectedCountryOption && this.isInternationalForm()) {
      const countryName = this.countryOptionLabel(this.selectedCountryOption);
      this.countrySearchKeyword = countryName;
      this.selectedCountryOriginalName = this.selectedCountryOption.name.common || countryName;
      this.form.patchValue({
        country: countryName,
        countrySearch: countryName,
      }, { emitEvent: false });
    }
  }

  private syncEditSelectionFromReferenceData(): void {
    if (!this.isEditMode || !this.isDomesticForm() || this.form.controls.subRegion.value) {
      return;
    }

    const destination = this.selectedDestination;
    const province = destination ? this.findProvinceForDestination(destination) : null;
    const subRegion = province
      ? this.getProvinceSubRegion(this.provinceDisplayName(province))
      : this.getProvinceSubRegion(this.form.controls.cityName.value || this.form.controls.name.value);

    if (province) {
      this.selectedProvince = province;
      this.provinceSearchKeyword = this.provinceDisplayName(province);
    } else if (this.isDomesticForm()) {
      this.provinceSearchKeyword = this.form.controls.cityName.value || this.form.controls.name.value;
    }

    if (subRegion) {
      this.form.controls.subRegion.setValue(subRegion, { emitEvent: false });
      this.filterDomesticProvinces();
    }
  }

  private resetDestinationSelectionState(): void {
    this.filteredDomesticProvinces = [];
    this.filteredInternationalCityOptions = [];
    this.provinceSearchKeyword = '';
    this.isProvinceDropdownOpen = false;
    this.activeProvinceIndex = -1;
    this.countrySearchKeyword = '';
    this.selectedCountryOriginalName = '';
    this.isCountryDropdownOpen = false;
    this.activeCountryIndex = -1;
    this.cityOptions = [];
    this.filteredCityOptions = [];
    this.citySearchKeyword = '';
    this.selectedCityName = '';
    this.isCityDropdownOpen = false;
    this.loadingCities = false;
    this.cityApiErrorMessage = null;
    this.manualCityMode = false;
    this.activeCityIndex = -1;
    this.selectedProvince = null;
    this.selectedCountryOption = null;
    this.manualInternationalCityInput = false;
    this.internationalCitiesWarning = '';
    this.internationalCityOptions = [];
  }

  private findProvinceForDestination(destination: AdminDestination): VietnamProvince | null {
    const name = this.normalizeText(destination.name || '');
    const slug = this.normalizeText((destination.slug || '').replace(/-/g, ' '));

    return this.vietnamProvinces.find((province) => {
      const displayName = this.normalizeText(this.provinceDisplayName(province));
      const rawName = this.normalizeText(province.name);
      const codeName = this.normalizeText(province.codename || '');

      return (!!name && (displayName === name || rawName === name || codeName === name))
        || (!!slug && (displayName === slug || rawName === slug || codeName === slug));
    }) || null;
  }

  private resolveDestinationRegion(destination: AdminDestination): DestinationRegion {
    if (destination.region === 'INTERNATIONAL') {
      return 'INTERNATIONAL';
    }

    if (destination.region === 'DOMESTIC') {
      return 'DOMESTIC';
    }

    return this.isInternationalDestination(destination) ? 'INTERNATIONAL' : 'DOMESTIC';
  }

  private buildPendingReview(destination: AdminDestination): DestinationPendingReviewViewModel {
    const parseResult = this.parseDestinationNewData(destination.newData);
    const pendingData = parseResult.data;
    const rows = pendingData ? this.buildPendingComparisonRows(destination, pendingData) : [];
    const status = this.parseStatus(destination.status);
    const hasParseError = !!parseResult.errorMessage;

    return {
      destination,
      title: destination.name || 'Điểm đến chưa đặt tên',
      slug: destination.slug || 'dang-cap-nhat',
      workflowLabel: this.workflowLabel(destination.status),
      workflowClassName: this.workflowClass(destination.status),
      displayLabel: this.displayLabel(destination),
      displayClassName: this.displayClass(destination),
      hasPendingData: this.hasPendingData(destination),
      parseError: parseResult.errorMessage,
      rows,
      canApproveReject:
        status === 'PENDING' &&
        !hasParseError &&
        this.canApproveDestination(destination) &&
        this.canRejectDestination(destination),
      canCancelApprove: status === 'PENDING' && this.canCancelApproveDestination(destination),
    };
  }

  private parseDestinationNewData(newData: AdminDestination['newData']): DestinationNewDataParseResult {
    if (newData === null || newData === undefined || newData === '') {
      return { data: null, errorMessage: '' };
    }

    if (this.isRecord(newData)) {
      return { data: newData as Partial<Record<DestinationPendingDataKey, unknown>>, errorMessage: '' };
    }

    if (typeof newData !== 'string' || !newData.trim()) {
      return { data: null, errorMessage: '' };
    }

    try {
      const parsed = JSON.parse(newData);

      if (!this.isRecord(parsed)) {
        return { data: null, errorMessage: 'Không thể đọc dữ liệu thay đổi.' };
      }

      return { data: parsed as Partial<Record<DestinationPendingDataKey, unknown>>, errorMessage: '' };
    } catch {
      return { data: null, errorMessage: 'Không thể đọc dữ liệu thay đổi.' };
    }
  }

  private buildPendingComparisonRows(
    destination: AdminDestination,
    pendingData: Partial<Record<DestinationPendingDataKey, unknown>>,
  ): DestinationPendingComparisonRow[] {
    const fields: Array<{ key: DestinationPendingDataKey; label: string; type: DestinationPendingFieldType }> = [
      { key: 'name', label: 'Tên điểm đến', type: 'text' },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'region', label: 'Khu vực', type: 'text' },
      { key: 'country', label: 'Quốc gia', type: 'text' },
      { key: 'description', label: 'Mô tả', type: 'text' },
      { key: 'imageUrl', label: 'Ảnh', type: 'image' },
      { key: 'latitude', label: 'Vĩ độ', type: 'number' },
      { key: 'longitude', label: 'Kinh độ', type: 'number' },
      { key: 'status', label: 'Workflow', type: 'status' },
      { key: 'isDisplay', label: 'Hiển thị public', type: 'display' },
    ];

    return fields.map((field) => {
      const currentRawValue = this.destinationFieldValue(destination, field.key);
      const pendingRawValue = Object.prototype.hasOwnProperty.call(pendingData, field.key)
        ? pendingData[field.key]
        : currentRawValue;
      const currentValue = this.formatPendingValue(field.type, currentRawValue);
      const pendingValue = this.formatPendingValue(field.type, pendingRawValue);

      return {
        key: field.key,
        label: field.label,
        currentValue,
        pendingValue,
        changed: currentValue !== pendingValue,
        type: field.type,
        currentImageUrl: field.type === 'image' ? String(currentRawValue || '') : '',
        pendingImageUrl: field.type === 'image' ? String(pendingRawValue || '') : '',
      };
    });
  }

  private destinationFieldValue(destination: AdminDestination, key: DestinationPendingDataKey): unknown {
    return destination[key as keyof AdminDestination];
  }

  private formatPendingValue(type: DestinationPendingFieldType, value: unknown): string {
    if (type === 'status') {
      return this.workflowLabel(typeof value === 'string' ? value : undefined);
    }

    if (type === 'display') {
      return isDestinationDisplayEnabled(value as string | number | boolean | null | undefined) ? 'Đang hiển thị' : 'Đang ẩn';
    }

    if (value === null || value === undefined || value === '') {
      return 'Chưa có';
    }

    return String(value);
  }

  private workflowSuccessMessage(action: DestinationBatchAction): string {
    switch (action) {
      case 'submit':
        return 'Đã gửi duyệt điểm đến.';
      case 'approve':
        return 'Đã duyệt điểm đến.';
      case 'reject':
        return 'Đã từ chối điểm đến.';
      case 'cancelApprove':
        return 'Đã hủy trình duyệt điểm đến.';
      case 'show':
        return 'Đã bật hiển thị public.';
      case 'hide':
        return 'Đã ẩn khỏi public.';
    }
  }

  private batchSuccessVerb(action: DestinationBatchAction): string {
    switch (action) {
      case 'submit':
        return 'Đã gửi duyệt';
      case 'approve':
        return 'Đã duyệt';
      case 'reject':
        return 'Đã từ chối';
      case 'cancelApprove':
        return 'Đã hủy trình duyệt';
      case 'show':
        return 'Đã bật hiển thị';
      case 'hide':
        return 'Đã ẩn';
    }
  }

  private syncBatchSelection(): void {
    this.selectedBatchDestinations = this.destinations.filter((destination) => !!destination.id && this.selectedDestinationIds.has(destination.id));
    this.selectedBatchCount = this.selectedBatchDestinations.length;

    if (!this.selectedBatchCount) {
      this.batchRejectMode = false;
      this.batchRejectReason = '';
      this.batchErrorMessage = '';
    }
  }

  private buildPayload(): AdminDestinationCreateRequest | AdminDestinationUpdateRequest {
    const rawValue = this.form.getRawValue();
    const region = rawValue.region as DestinationRegion;
    const name = (rawValue.cityName || rawValue.name).trim();
    const slugSource = rawValue.slug.trim() || name;
    const payload: AdminDestinationCreateRequest | AdminDestinationUpdateRequest = {
      name,
      slug: this.generateSlug(slugSource) || slugSource,
      region,
      country: region === 'DOMESTIC' ? 'Việt Nam' : rawValue.country.trim(),
      description: rawValue.description.trim() || undefined,
      imageUrl: rawValue.imageUrl.trim() || undefined,
      latitude: this.parseNumber(rawValue.latitude) ?? null,
      longitude: this.parseNumber(rawValue.longitude) ?? null,
    };

    if (this.isEditMode) {
      return {
        ...payload,
        status: this.parseStatus(rawValue.status) || 'DRAFT',
      };
    }

    return payload;
  }

  private upsertDestination(destination: AdminDestination): void {
    this.destinations = [
      destination,
      ...this.destinations.filter((item) => item.id !== destination.id),
    ].sort((a, b) => this.sortDestination(a, b));
    this.applyFilters();
    this.syncBatchSelection();
  }

  private extractList(response: unknown): AdminDestination[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (!this.isRecord(response)) {
      return [];
    }

    const data = response['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (this.isRecord(data) && Array.isArray(data['content'])) {
      return data['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    if (Array.isArray(response['content'])) {
      return response['content'].map((item) => this.normalizeDestination(item)).filter(this.isDestination);
    }

    return [];
  }

  private extractItem(response: unknown): AdminDestination | null {
    if (this.isRecord(response) && this.isRecord(response['data'])) {
      return this.normalizeDestination(response['data']);
    }

    return this.normalizeDestination(response);
  }

  private extractBatchActionResponse(response: unknown): DestinationBatchActionResponse | null {
    const source = this.isRecord(response) && this.isRecord(response['data']) ? response['data'] : response;

    if (!this.isRecord(source)) {
      return null;
    }

    const total = this.parseNumber(source['total']);
    const successCount = this.parseNumber(source['successCount']);
    const failedCount = this.parseNumber(source['failedCount']);

    if (total === undefined || successCount === undefined || failedCount === undefined) {
      return null;
    }

    return {
      total,
      successCount,
      failedCount,
      successItems: Array.isArray(source['successItems'])
        ? source['successItems'].map((item) => this.normalizeBatchActionItem(item))
        : [],
      failedItems: Array.isArray(source['failedItems'])
        ? source['failedItems'].map((item) => this.normalizeBatchActionItem(item))
        : [],
    };
  }

  private normalizeBatchActionItem(value: unknown) {
    const record = this.isRecord(value) ? value : {};

    return {
      id: this.parseNumber(record['id']) ?? null,
      name: typeof record['name'] === 'string' ? record['name'] : null,
      success: Boolean(record['success']),
      message: typeof record['message'] === 'string' ? record['message'] : null,
    };
  }

  private fallbackBatchResponse(total: number): DestinationBatchActionResponse {
    return {
      total,
      successCount: total,
      failedCount: 0,
      successItems: [],
      failedItems: [],
    };
  }

  private normalizeDestination(value: unknown): AdminDestination | null {
    if (!this.isRecord(value)) {
      return null;
    }

    return value as AdminDestination;
  }

  private hasAnyRole(...roles: RoleCode[]): boolean {
    return this.authService.hasRole(...roles);
  }

  private denyDestinationAction(): void {
    this.errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
    this.feedback.warning(this.errorMessage);
  }

  private matchesRegionFilter(destination: AdminDestination): boolean {
    if (this.regionFilter === 'ALL') {
      return true;
    }

    if (this.regionFilter === 'DOMESTIC') {
      return this.isDomesticDestination(destination);
    }

    return this.isInternationalDestination(destination);
  }

  private isDomesticDestination(destination: AdminDestination): boolean {
    const region = this.normalizeText(destination.region || '');
    const country = this.normalizeText(destination.country || '');

    return region === 'domestic'
      || region.includes('trong-nuoc')
      || region.includes('viet-nam')
      || country === 'viet-nam'
      || country === 'vn';
  }

  private isInternationalDestination(destination: AdminDestination): boolean {
    const region = this.normalizeText(destination.region || '');

    return region === 'international'
      || region.includes('quoc-te')
      || (!!destination.country && !this.isDomesticDestination(destination));
  }

  private sortDestination(a: AdminDestination, b: AdminDestination): number {
    const regionCompare = (a.region || '').localeCompare(b.region || '', 'vi');

    if (regionCompare !== 0) {
      return regionCompare;
    }

    return (a.name || '').localeCompare(b.name || '', 'vi') || (a.id ?? 0) - (b.id ?? 0);
  }

  private generateSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private parseStatus(status?: string): DestinationStatus | null {
    return status === 'DRAFT' ||
      status === 'PENDING' ||
      status === 'APPROVED' ||
      status === 'REJECTED' ||
      status === 'CANCEL_APPROVE'
      ? status
      : null;
  }

  private errorText(error: unknown, fallback: string): string {
    if (this.isRecord(error)) {
      const status = this.parseNumber(error['status']);

      if (status === 401 || status === 403) {
        return 'Phiên đăng nhập admin không hợp lệ hoặc không đủ quyền quản lý điểm đến.';
      }

      const errorBody = error['error'];

      if (this.isRecord(errorBody) && typeof errorBody['message'] === 'string') {
        return errorBody['message'];
      }
    }

    return fallback;
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private numberToInput(value: unknown): string {
    const parsed = this.parseNumber(value);
    return parsed === undefined ? '' : String(parsed);
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');
  }

  private isDestination(value: AdminDestination | null): value is AdminDestination {
    return !!value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
