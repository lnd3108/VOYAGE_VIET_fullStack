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

import { Dashboard } from './pages/admin/dashboard/dashboard';
import { AdminCategories } from './pages/admin/categories/categories';
import { AdminDestinations } from './pages/admin/destinations/destinations';
import { AdminTours } from './pages/admin/tours/tours';
import { AdminBookings } from './pages/admin/bookings/bookings';
import { AdminUsers } from './pages/admin/users/users';
import { AdminReviews } from './pages/admin/reviews/reviews';
import { AdminMedia } from './pages/admin/media/media';
import { AdminFeatures } from './pages/admin/features/features';
import { AdminAuditLogs } from './pages/admin/audit-logs/audit-logs';

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
        component: Dashboard,
        title: 'Admin Dashboard - VoyageViet',
      },
      {
        path: 'categories',
        component: AdminCategories,
        title: 'Quản lý danh mục - VoyageViet',
      },
      {
        path: 'destinations',
        component: AdminDestinations,
        title: 'Quản lý điểm đến - VoyageViet',
      },
      {
        path: 'tours',
        component: AdminTours,
        title: 'Quản lý tour - VoyageViet',
      },
      {
        path: 'bookings',
        component: AdminBookings,
        title: 'Quản lý booking - VoyageViet',
      },
      {
        path: 'users',
        component: AdminUsers,
        title: 'Quản lý người dùng - VoyageViet',
      },
      {
        path: 'reviews',
        component: AdminReviews,
        title: 'Quản lý đánh giá - VoyageViet',
      },
      {
        path: 'media',
        component: AdminMedia,
        title: 'Quản lý media - VoyageViet',
      },
      {
        path: 'features',
        component: AdminFeatures,
        title: 'Quản lý tính năng - VoyageViet',
      },
      {
        path: 'audit-logs',
        component: AdminAuditLogs,
        title: 'Nhật ký hệ thống - VoyageViet',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
