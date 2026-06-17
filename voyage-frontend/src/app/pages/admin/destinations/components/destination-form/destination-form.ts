import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { catchError, of } from 'rxjs';

import { AdminDestinationApiService } from '../../../../../core/api/admin-destination-api.service';
import { VietnamProvinceApiService } from '../../../../../core/api/vietnam-province-api.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  AdminDestination,
  AdminDestinationCreateRequest,
  AdminDestinationUpdateRequest,
  CountryOption,
  DestinationRegion,
  DestinationStatus,
  DestinationSubRegion,
  ProvinceRegionMap,
} from '../../../../../core/models/destination.model';
import { VietnamProvince } from '../../../../../core/models/vietnam-province.model';
import { AdminUiFeedbackService } from '../../../../../core/services/admin-ui-feedback.service';
import { AdminImageUpload } from '../../../shared/admin-image-upload/admin-image-upload';
import { DESTINATION_FALLBACK_IMAGE, generateSlug, normalizeText, parseStatus } from '../../destination-utils';

type AdminDestinationFormMode = 'create' | 'edit';

interface FilterOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-admin-destination-form',
  standalone: true,
  imports: [AdminImageUpload, NgFor, NgIf, ReactiveFormsModule, RouterLink, TuiIcon],
  templateUrl: './destination-form.html',
  styleUrl: './destination-form.scss',
})
export class AdminDestinationFormComponent implements OnChanges, OnInit {
  private readonly destinationApi = inject(AdminDestinationApiService);
  private readonly provinceApi = inject(VietnamProvinceApiService);
  private readonly feedback = inject(AdminUiFeedbackService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Input() destination: AdminDestination | null = null;
  @Input() mode: AdminDestinationFormMode = 'create';

  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  readonly fallbackImage = DESTINATION_FALLBACK_IMAGE;
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

  saving = false;
  updatingImage = false;
  focusedSelect: 'subRegion' | null = null;
  vietnamProvinces: VietnamProvince[] = [];
  allCountryOptions: CountryOption[] = [];
  countryOptions: CountryOption[] = [];
  filteredDomesticProvinces: VietnamProvince[] = [];
  filteredCountryOptions: CountryOption[] = [];
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
  destinationDataWarning = '';
  internationalCitiesWarning = '';
  internationalCityOptions: string[] = [];
  filteredInternationalCityOptions: string[] = [];
  manualInternationalCityInput = false;
  internationalCitiesLoading = false;
  private slugManuallyEdited = false;
  private referencesLoaded = false;

  ngOnInit(): void {
    this.setupDestinationDataSelection();
    this.loadDestinationReferenceData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['destination'] || changes['mode']) {
      this.resetFormForMode();
    }
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

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  close(): void {
    if (!this.saving && !this.updatingImage) {
      this.closed.emit();
    }
  }

  submitDraft(): void {
    this.saveDestination(false);
  }

  submitAndSend(): void {
    this.saveDestination(true);
  }

  handleNameInput(): void {
    if (this.isEditMode || this.slugManuallyEdited) {
      return;
    }

    this.form.controls.slug.setValue(generateSlug(this.form.controls.name.value));
  }

  markSlugEdited(): void {
    this.slugManuallyEdited = true;
  }

  selectRegion(region: DestinationRegion): void {
    if (this.form.controls.region.value !== region) {
      this.form.controls.region.setValue(region);
    }
  }

  toggleSelect(selectName: 'subRegion'): void {
    this.focusedSelect = this.focusedSelect === selectName ? null : selectName;
  }

  selectSubRegion(subRegion: DestinationSubRegion | ''): void {
    this.form.controls.subRegion.setValue(subRegion);
    this.focusedSelect = null;
  }

  subRegionLabel(subRegion?: string): string {
    return this.subRegionOptions.find((option) => option.value === subRegion)?.label || 'Chọn miền';
  }

  onProvinceInput(value: string): void {
    this.provinceSearchKeyword = value;
    this.activeProvinceIndex = -1;

    if (!this.selectedProvince || normalizeText(value) !== normalizeText(this.provinceDisplayName(this.selectedProvince))) {
      this.clearProvinceSelection(false);
      this.provinceSearchKeyword = value;
    }

    this.filterDomesticProvinces();
    this.isProvinceDropdownOpen = this.shouldShowProvincePicker();
  }

  handleProvinceInputMouseDown(event: MouseEvent): void {
    this.handleAutocompleteInputMouseDown(event, this.isProvinceDropdownOpen, () => this.openProvinceDropdown(), () => this.closeProvinceDropdown());
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
    this.isProvinceDropdownOpen ? this.closeProvinceDropdown() : this.openProvinceDropdown();
  }

  selectProvince(province: VietnamProvince): void {
    const name = this.provinceDisplayName(province);

    this.selectedProvince = province;
    this.provinceSearchKeyword = name;
    this.form.patchValue({
      cityName: name,
      name,
      country: 'Việt Nam',
      slug: this.slugManuallyEdited ? this.form.controls.slug.value : generateSlug(name),
    }, { emitEvent: false });
    this.closeProvinceDropdown();
  }

  clearProvinceSelection(clearKeyword = true): void {
    this.selectedProvince = null;
    if (clearKeyword) {
      this.provinceSearchKeyword = '';
    }
    this.form.patchValue({ cityName: '', name: '', slug: this.slugManuallyEdited ? this.form.controls.slug.value : '' }, { emitEvent: false });
  }

  onProvinceKeydown(event: KeyboardEvent): void {
    this.handleAutocompleteKeydown(event, this.filteredDomesticProvinces.length, this.activeProvinceIndex, (index) => {
      this.activeProvinceIndex = index;
    }, () => {
      const province = this.filteredDomesticProvinces[this.activeProvinceIndex];
      if (province) {
        this.selectProvince(province);
      }
    }, () => this.closeProvinceDropdown());
  }

  onCountryInput(value: string): void {
    this.countrySearchKeyword = value;
    this.activeCountryIndex = -1;

    if (!this.selectedCountryOption || normalizeText(value) !== normalizeText(this.countryOptionLabel(this.selectedCountryOption))) {
      this.clearCountrySelection(false);
      this.countrySearchKeyword = value;
    }

    this.filterCountryOptions();
    this.isCountryDropdownOpen = true;
  }

  handleCountryInputMouseDown(event: MouseEvent): void {
    this.handleAutocompleteInputMouseDown(event, this.isCountryDropdownOpen, () => this.openCountryDropdown(), () => this.closeCountryDropdown());
  }

  openCountryDropdown(): void {
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
    this.isCountryDropdownOpen ? this.closeCountryDropdown() : this.openCountryDropdown();
  }

  selectCountry(country: CountryOption): void {
    const countryName = this.countryOptionLabel(country);

    this.selectedCountryOption = country;
    this.selectedCountryOriginalName = country.name.common || countryName;
    this.countrySearchKeyword = countryName;
    this.form.patchValue({ country: countryName, countrySearch: countryName, cityName: '', citySearch: '', name: '', slug: this.slugManuallyEdited ? this.form.controls.slug.value : '' }, { emitEvent: false });
    this.resetCitySelection();
    this.closeCountryDropdown();
    this.loadInternationalCitiesForSelectedCountry();
  }

  clearCountrySelection(clearKeyword = true): void {
    this.selectedCountryOption = null;
    this.selectedCountryOriginalName = '';
    if (clearKeyword) {
      this.countrySearchKeyword = '';
    }
    this.form.patchValue({ country: clearKeyword ? '' : this.form.controls.country.value, cityName: '', citySearch: '', name: '', slug: this.slugManuallyEdited ? this.form.controls.slug.value : '' }, { emitEvent: false });
    this.resetCitySelection();
  }

  onCountryKeydown(event: KeyboardEvent): void {
    this.handleAutocompleteKeydown(event, this.filteredCountryOptions.length, this.activeCountryIndex, (index) => {
      this.activeCountryIndex = index;
    }, () => {
      const country = this.filteredCountryOptions[this.activeCountryIndex];
      if (country) {
        this.selectCountry(country);
      }
    }, () => this.closeCountryDropdown());
  }

  onCityInput(value: string): void {
    this.citySearchKeyword = value;
    this.activeCityIndex = -1;
    this.form.patchValue({ citySearch: value }, { emitEvent: false });
    this.filterCityOptions();
    this.isCityDropdownOpen = this.shouldShowInternationalCityPicker();

    if (this.manualCityMode) {
      this.selectedCityName = value;
      this.setDestinationName(value);
    }
  }

  handleCityInputMouseDown(event: MouseEvent): void {
    this.handleAutocompleteInputMouseDown(event, this.isCityDropdownOpen, () => this.openCityDropdown(), () => this.closeCityDropdown());
  }

  openCityDropdown(): void {
    if (!this.shouldShowInternationalCityPicker()) {
      return;
    }

    this.closeProvinceDropdown();
    this.closeCountryDropdown();
    this.filterCityOptions();
    this.isCityDropdownOpen = true;
  }

  closeCityDropdown(): void {
    this.isCityDropdownOpen = false;
    this.activeCityIndex = -1;
  }

  toggleCityDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isCityDropdownOpen ? this.closeCityDropdown() : this.openCityDropdown();
  }

  filterCityOptions(): void {
    const keyword = normalizeText(this.citySearchKeyword);
    this.filteredCityOptions = this.cityOptions
      .filter((city) => !keyword || normalizeText(city).includes(keyword))
      .slice(0, 80);
  }

  selectCity(cityName: string): void {
    const normalizedName = cityName.trim();
    this.selectedCityName = normalizedName;
    this.citySearchKeyword = normalizedName;
    this.form.patchValue({
      cityName: normalizedName,
      citySearch: normalizedName,
      name: normalizedName,
      slug: this.slugManuallyEdited ? this.form.controls.slug.value : generateSlug(normalizedName),
    }, { emitEvent: false });
    this.closeCityDropdown();
  }

  commitManualCity(): void {
    if (!this.manualCityMode) {
      return;
    }

    const value = this.citySearchKeyword.trim();
    if (value) {
      this.selectCity(value);
    }
  }

  handleCityKeydown(event: KeyboardEvent): void {
    this.handleAutocompleteKeydown(event, this.filteredCityOptions.length, this.activeCityIndex, (index) => {
      this.activeCityIndex = index;
    }, () => {
      const city = this.filteredCityOptions[this.activeCityIndex];
      if (city) {
        this.selectCity(city);
      }
    }, () => this.closeCityDropdown());
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
    return this.isInternationalForm() && !!this.form.controls.country.value.trim() && !this.loadingCities;
  }

  provinceDisplayName(province: VietnamProvince): string {
    return province.displayName || this.shortProvinceName(province.name);
  }

  countryOptionLabel(country: CountryOption): string {
    return this.getVietnameseCountryName(country);
  }

  imagePreviewUrl(): string {
    return this.form.controls.imageUrl.value.trim();
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith(this.fallbackImage)) {
      image.src = this.fallbackImage;
    }
  }

  updateImageOnly(): void {
    const destinationId = this.destination?.id;

    if (!this.isEditMode || !destinationId || this.updatingImage) {
      return;
    }

    const imageUrl = this.form.controls.imageUrl.value.trim();

    if (!imageUrl) {
      this.feedback.warning('Vui lòng nhập URL ảnh trước khi cập nhật ảnh.');
      return;
    }

    this.updatingImage = true;

    this.destinationApi
      .updateDestinationImage(destinationId, imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updatingImage = false;
          this.feedback.success('Đã cập nhật ảnh điểm đến.');
          this.completed.emit();
        },
        error: (error) => {
          this.updatingImage = false;
          this.feedback.error(this.errorText(error, 'Không thể cập nhật ảnh điểm đến. Vui lòng thử lại sau.'));
        },
      });
  }

  canOpenFullMediaLibrary(): boolean {
    return this.auth.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  private saveDestination(submitCreate: boolean): void {
    if (!this.canSaveDestination()) {
      this.denyDestinationAction();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const destinationId = this.destination?.id;

    if (this.isEditMode && !destinationId) {
      this.feedback.error('Không xác định được điểm đến cần cập nhật.');
      return;
    }

    this.saving = true;
    const request$ = !this.isEditMode && submitCreate
      ? this.destinationApi.createAndSubmitDestination(payload as AdminDestinationCreateRequest)
      : this.isEditMode
        ? this.destinationApi.updateDestination(destinationId as number, payload as AdminDestinationUpdateRequest)
        : this.destinationApi.createDestination(payload as AdminDestinationCreateRequest);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.feedback.success(submitCreate ? 'Đã lưu và gửi duyệt điểm đến.' : this.isEditMode ? 'Đã lưu dữ liệu thay đổi chờ duyệt.' : 'Đã tạo điểm đến mới.');
          this.completed.emit();
          this.closed.emit();
        },
        error: (error) => {
          this.saving = false;
          this.feedback.error(this.errorText(error, 'Không thể lưu điểm đến. Vui lòng thử lại sau.'));
        },
      });
  }

  private buildPayload(): AdminDestinationCreateRequest | AdminDestinationUpdateRequest {
    const rawValue = this.form.getRawValue();
    const region = rawValue.region as DestinationRegion;
    const name = (rawValue.cityName || rawValue.name).trim();
    const slugSource = rawValue.slug.trim() || name;
    const payload: AdminDestinationCreateRequest | AdminDestinationUpdateRequest = {
      name,
      slug: generateSlug(slugSource) || slugSource,
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
        status: parseStatus(rawValue.status) || 'DRAFT',
      };
    }

    return payload;
  }

  private resetFormForMode(): void {
    this.saving = false;
    this.updatingImage = false;
    this.resetDestinationSelectionState();

    if (!this.isEditMode || !this.destination) {
      this.slugManuallyEdited = false;
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
      this.filterDomesticProvinces();
      this.filterCountryOptions();
      return;
    }

    const region = this.resolveDestinationRegion(this.destination);
    const cityName = this.destination.name || '';
    const country = region === 'DOMESTIC' ? 'Việt Nam' : this.destination.country || '';
    const province = region === 'DOMESTIC' ? this.findProvinceForDestination(this.destination) : null;
    const subRegion = province ? this.getProvinceSubRegion(this.provinceDisplayName(province)) : this.getProvinceSubRegion(cityName);

    this.slugManuallyEdited = true;
    this.selectedProvince = province;
    this.provinceSearchKeyword = region === 'DOMESTIC' ? cityName : '';
    this.countrySearchKeyword = region === 'INTERNATIONAL' ? country : '';
    this.citySearchKeyword = region === 'INTERNATIONAL' ? cityName : '';
    this.selectedCityName = region === 'INTERNATIONAL' ? cityName : '';
    this.form.reset({
      name: cityName,
      slug: this.destination.slug || '',
      region,
      subRegion: region === 'DOMESTIC' ? subRegion || '' : '',
      country,
      cityName,
      countrySearch: region === 'INTERNATIONAL' ? country : '',
      citySearch: cityName,
      description: this.destination.description || '',
      imageUrl: this.destination.imageUrl || '',
      latitude: this.numberToInput(this.destination.latitude),
      longitude: this.numberToInput(this.destination.longitude),
      status: parseStatus(this.destination.status) || 'DRAFT',
    }, { emitEvent: false });
    this.filterDomesticProvinces();
    this.filterCountryOptions();
    this.filterCityOptions();
    this.syncSelectedCountryOption();
    if (region === 'INTERNATIONAL') {
      this.loadInternationalCitiesForSelectedCountry();
    }
  }

  private loadDestinationReferenceData(): void {
    this.destinationDataWarning = '';

    this.provinceApi
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
        this.referencesLoaded = true;
        this.syncEditSelectionFromReferenceData();
      });

    this.destinationApi
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
      this.resetCitySelection();
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
        slug: this.slugManuallyEdited ? this.form.controls.slug.value : '',
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
      slug: this.slugManuallyEdited ? this.form.controls.slug.value : '',
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
      slug: this.slugManuallyEdited ? this.form.controls.slug.value : '',
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
      this.resetCitySelection();
      return;
    }

    this.internationalCitiesLoading = true;
    this.loadingCities = true;
    this.internationalCitiesWarning = '';
    this.cityApiErrorMessage = null;
    this.manualInternationalCityInput = false;
    this.manualCityMode = false;

    this.destinationApi
      .getCitiesByCountry(country)
      .pipe(
        catchError(() => {
          this.cityApiErrorMessage = 'Không tải được danh sách thành phố, bạn có thể nhập thủ công.';
          this.internationalCitiesWarning = this.cityApiErrorMessage;
          const fallbackCities = this.fallbackInternationalCityMap[country] || [];
          this.manualCityMode = fallbackCities.length === 0;
          return of({ data: fallbackCities });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.internationalCityOptions = this.normalizeCityOptions(response.data || []);
        this.cityOptions = this.internationalCityOptions;
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

  private resetCitySelection(): void {
    this.internationalCityOptions = [];
    this.filteredInternationalCityOptions = [];
    this.cityOptions = [];
    this.filteredCityOptions = [];
    this.internationalCitiesWarning = '';
    this.manualInternationalCityInput = false;
    this.manualCityMode = false;
    this.cityApiErrorMessage = null;
    this.citySearchKeyword = '';
    this.selectedCityName = '';
    this.isCityDropdownOpen = false;
    this.activeCityIndex = -1;
  }

  private closeAllAutocompleteDropdowns(): void {
    this.closeProvinceDropdown();
    this.closeCountryDropdown();
    this.closeCityDropdown();
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
    return Array.from(new Set(cities.map((city) => city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'));
  }

  private shortProvinceName(name: string): string {
    return name.replace(/^Thành phố\s+/i, '').replace(/^Tỉnh\s+/i, '').trim();
  }

  private setDestinationName(name: string): void {
    const normalizedName = name.trim();
    this.form.patchValue({
      name: normalizedName,
      slug: this.slugManuallyEdited ? this.form.controls.slug.value : generateSlug(normalizedName),
      cityName: normalizedName,
    }, { emitEvent: false });
  }

  private filterDomesticProvinces(): void {
    const subRegion = this.form.controls.subRegion.value as DestinationSubRegion | '';
    const keyword = normalizeText(this.provinceSearchKeyword);

    if (!subRegion) {
      this.filteredDomesticProvinces = [];
      return;
    }

    const allowedNames = new Set(this.provinceRegionMap[subRegion].map((name) => normalizeText(name)));
    this.filteredDomesticProvinces = this.vietnamProvinces.filter((province) => {
      const displayName = this.provinceDisplayName(province);
      const normalizedDisplayName = normalizeText(displayName);
      const normalizedRawName = normalizeText(province.name);
      const matchesRegion = allowedNames.has(normalizedDisplayName) || allowedNames.has(normalizedRawName);
      const matchesKeyword = !keyword || normalizedDisplayName.includes(keyword) || normalizedRawName.includes(keyword);

      return matchesRegion && matchesKeyword;
    });
  }

  private filterCountryOptions(): void {
    const keyword = normalizeText(this.countrySearchKeyword);

    this.filteredCountryOptions = this.allCountryOptions
      .filter((country) => {
        const vietnamese = normalizeText(this.countryOptionLabel(country));
        const common = normalizeText(country.name.common || '');
        const official = normalizeText(country.name.official || '');
        const code = normalizeText(country.cca2 || '');

        return !keyword || vietnamese.includes(keyword) || common.includes(keyword) || official.includes(keyword) || code.includes(keyword);
      })
      .slice(0, 80);
  }

  private syncSelectedCountryOption(): void {
    const selectedCountry = this.form.controls.country.value.trim();

    this.selectedCountryOption = this.countryOptions.find((country) =>
      normalizeText(this.countryOptionLabel(country)) === normalizeText(selectedCountry)
      || normalizeText(country.name.common || '') === normalizeText(selectedCountry),
    ) || null;

    if (this.selectedCountryOption && this.isInternationalForm()) {
      const countryName = this.countryOptionLabel(this.selectedCountryOption);
      this.countrySearchKeyword = countryName;
      this.selectedCountryOriginalName = this.selectedCountryOption.name.common || countryName;
      this.form.patchValue({ country: countryName, countrySearch: countryName }, { emitEvent: false });
    }
  }

  private syncEditSelectionFromReferenceData(): void {
    if (!this.isEditMode || !this.isDomesticForm() || this.form.controls.subRegion.value || !this.referencesLoaded) {
      return;
    }

    const province = this.destination ? this.findProvinceForDestination(this.destination) : null;
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
    const name = normalizeText(destination.name || '');
    const slug = normalizeText((destination.slug || '').replace(/-/g, ' '));

    return this.vietnamProvinces.find((province) => {
      const displayName = normalizeText(this.provinceDisplayName(province));
      const rawName = normalizeText(province.name);
      const codeName = normalizeText(province.codename || '');

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

  private getProvinceSubRegion(provinceName: string): DestinationSubRegion | null {
    const normalizedName = normalizeText(provinceName);

    return this.subRegionOptions.find((option) =>
      this.provinceRegionMap[option.value].some((name) => normalizeText(name) === normalizedName),
    )?.value || null;
  }

  private isInternationalDestination(destination: AdminDestination): boolean {
    const region = normalizeText(destination.region || '');
    return region === 'international' || region.includes('quoc-te') || (!!destination.country && !this.isDomesticDestination(destination));
  }

  private isDomesticDestination(destination: AdminDestination): boolean {
    const region = normalizeText(destination.region || '');
    const country = normalizeText(destination.country || '');
    return region === 'domestic' || region.includes('trong-nuoc') || region.includes('viet-nam') || country === 'viet-nam' || country === 'vn';
  }

  private handleAutocompleteInputMouseDown(event: MouseEvent, isOpen: boolean, open: () => void, close: () => void): void {
    event.stopPropagation();
    if (isOpen) {
      close();
      return;
    }
    open();
  }

  private handleAutocompleteKeydown(
    event: KeyboardEvent,
    length: number,
    activeIndex: number,
    setActiveIndex: (index: number) => void,
    selectActive: () => void,
    close: () => void,
  ): void {
    if (!length && event.key !== 'Escape') {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(activeIndex < length - 1 ? activeIndex + 1 : 0);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(activeIndex > 0 ? activeIndex - 1 : length - 1);
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectActive();
      return;
    }

    if (event.key === 'Escape') {
      close();
    }
  }

  private canSaveDestination(): boolean {
    return this.auth.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  private denyDestinationAction(): void {
    this.feedback.warning('Bạn không có quyền thực hiện thao tác này.');
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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
