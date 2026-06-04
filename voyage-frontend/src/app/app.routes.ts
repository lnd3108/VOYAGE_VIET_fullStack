import { Routes } from '@angular/router';

import { PublicLayout } from './layouts/public-layout/public-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Home } from './pages/public/home/home';
import { Tours } from './pages/public/tours/tours';
import { TourDetail } from './pages/public/tour-detail/tour-detail';
import { Login } from './pages/public/auth/login/login';
import { Register } from './pages/public/auth/register/register';
import { ForgotPassword } from './pages/public/auth/forgot-password/forgot-password';
import { ResetPassword } from './pages/public/auth/reset-password/reset-password';
import { VerifyEmail } from './pages/public/auth/verify-email/verify-email';
import { BookingLookup } from './pages/public/booking-lookup/booking-lookup';
import { BookingCheckout } from './pages/public/booking-checkout/booking-checkout';
import { BookingSuccess } from './pages/public/booking-success/booking-success';
import { MyBookings } from './pages/public/my-bookings/my-bookings';
import { Profile } from './pages/public/profile/profile';
import { Wishlist } from './pages/public/wishlist/wishlist';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        component: Home,
        title: 'VoyageViet - Trang chủ',
      },
      {
        path: 'tours',
        component: Tours,
        title: 'Tour du lịch - VoyageViet',
      },
      {
        path: 'tours/:slug',
        component: TourDetail,
        title: 'Chi tiết tour - VoyageViet',
      },
      {
        path: 'login',
        component: Login,
        title: 'Đăng nhập - VoyageViet',
      },
      {
        path: 'register',
        component: Register,
        title: 'Đăng ký - VoyageViet',
      },
      {
        path: 'forgot-password',
        component: ForgotPassword,
        title: 'Quên mật khẩu - VoyageViet',
      },
      {
        path: 'reset-password',
        component: ResetPassword,
        title: 'Đặt lại mật khẩu - VoyageViet',
      },
      {
        path: 'verify-email',
        component: VerifyEmail,
        title: 'Xác thực email - VoyageViet',
      },
      {
        path: 'booking-lookup',
        component: BookingLookup,
        title: 'Tra cứu booking - VoyageViet',
      },
      {
        path: 'booking/checkout',
        component: BookingCheckout,
        canActivate: [authGuard],
        title: 'Thanh toán booking - VoyageViet',
      },
      {
        path: 'booking-success',
        component: BookingSuccess,
        title: 'Đặt tour thành công - VoyageViet',
      },
      {
        path: 'wishlist',
        component: Wishlist,
        canActivate: [authGuard],
        title: 'Tour yêu thích - VoyageViet',
      },
      {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard],
        title: 'Hồ sơ cá nhân - VoyageViet',
      },
      {
        path: 'my-bookings',
        component: MyBookings,
        canActivate: [authGuard],
        title: 'Booking của tôi - VoyageViet',
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Admin Dashboard - VoyageViet',
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin/categories/categories').then((m) => m.AdminCategories),
        title: 'Quản lý danh mục - VoyageViet',
      },
      {
        path: 'destinations',
        loadComponent: () => import('./pages/admin/destinations/destinations').then((m) => m.AdminDestinations),
        title: 'Quản lý điểm đến - VoyageViet',
      },
      {
        path: 'tours/new',
        loadComponent: () => import('./pages/admin/tours/tour-form/tour-form').then((m) => m.TourForm),
        title: 'Thêm tour mới - VoyageViet',
      },
      {
        path: 'tours/:id/edit',
        loadComponent: () => import('./pages/admin/tours/tour-form/tour-form').then((m) => m.TourForm),
        title: 'Cập nhật tour - VoyageViet',
      },
      {
        path: 'tours',
        loadComponent: () => import('./pages/admin/tours/tours').then((m) => m.AdminTours),
        title: 'Quản lý tour - VoyageViet',
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/admin/bookings/bookings').then((m) => m.AdminBookings),
        title: 'Quản lý booking - VoyageViet',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users').then((m) => m.AdminUsers),
        title: 'Quản lý người dùng - VoyageViet',
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/admin/reviews/reviews').then((m) => m.AdminReviews),
        title: 'Quản lý đánh giá - VoyageViet',
      },
      {
        path: 'media',
        loadComponent: () => import('./pages/admin/media/media').then((m) => m.AdminMedia),
        title: 'Quản lý media - VoyageViet',
      },
      {
        path: 'features',
        loadComponent: () => import('./pages/admin/features/features').then((m) => m.AdminFeatures),
        title: 'Quản lý tính năng - VoyageViet',
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./pages/admin/audit-logs/audit-logs').then((m) => m.AdminAuditLogs),
        title: 'Nhật ký hệ thống - VoyageViet',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
