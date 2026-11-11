> **INSTRUKSI AGENT**: Setiap kali ada kesepakatan baru terkait user hub / authenticated app (pola auth, UI convention baru, perubahan i18n, struktur route) — **langsung perbarui file ini** sebelum lanjut ke pekerjaan lain.

# App Guide — Next.js (User Hub & Authenticated App)

App: `apps/app` — domain `app.domain.com` (Port dev: 10314)

## Konteks & Arsitektur

- `apps/app` adalah aplikasi khusus pengguna terautentikasi (User Hub / Creator Hub).
- Rute auth berada di bawah `/auth/*`:
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`
  - `/auth/reset-password`
  - `/auth/verify-email`
- Rute dashboard pengguna berada di root `/` dan sub-path fitur:
  - `/` → Overview Dashboard
  - `/news` & `/news/[slug]` → Berita & Pengumuman
  - `/notifications` → Notifikasi pengguna
  - `/account` → Overview Akun
  - `/account/profile` → Profil pengguna
  - `/account/security` → Password, 2FA, Email change
  - `/account/notification-preferences` → Preferensi notifikasi & device push

## Route Protection (2 Layer)

1. **`src/middleware.ts`** (Next.js middleware):
   - Cek cookie `access_token` dan `refresh_token`.
   - `PUBLIC_PATHS = ['/auth']`.
   - Rute non-publik tanpa session diarahkan ke `/auth/login?next=<pathname>`.
   - Rute auth saat session aktif diarahkan ke `/` (kecuali verify-email & reset-password).
   - Injeksi cookie `locale` otomatis jika belum ada.
2. **`AppShell`** (`src/components/layouts/app-shell.tsx`):
   - Jika pathname diawali `/auth`, render polos `{children}`.
   - Jika rute terproteksi, render `AuthenticatedAppShell` dengan `AppSidebar` (collapsible), topbar, and `MobileBottomNav`.
   - Panggil `fetchMe()` di client-side untuk validasi user dan hidrasi store.

## Auth Store (`useAuthStore`)

- Zustand persist store dengan key `app_auth`.
- Menyimpan objek `user` dan status `isAuthenticated`. Tidak menyimpan token di localStorage.
- Logout flow: `api.post('/auth/logout')` → clear store → `window.location.href = '/auth/login'`.

## Data Fetching & API

- Axios instance di `src/lib/api.ts` dengan `withCredentials: true`.
- Otomatis menyertakan header `X-CSRF-Token` (Double-Submit Cookie).
- Auto-refresh on 401: silent refresh ke `/auth/refresh`. Jika refresh gagal, redirect ke `/auth/login?next=...`.
- Server Component fetch menggunakan helper `apiFetch(endpoint, options)`.

## i18n (Internasionalisasi)

- Sourced from `@ahansk/shared` (`localeRegistry`).
- Menggabungkan layer `modules` (auth, common, notifications) dan `frontend` (nav, dashboard, account).
- Dilarang hardcode string UI di TSX/JSX.

## Fitur Keamanan: Change Email Flow (4-Step Verification)

- Alur ubah email di `/account/security` wajib menggunakan stepper 4 langkah modular (`components/change-email-section.tsx`):
  1. Input Password saat ini &rarr; kirim OTP ke **email lama**.
  2. Input OTP email lama &rarr; verifikasi & dapatkan tiket sesi.
  3. Input Email baru &rarr; kirim OTP ke **email baru**.
  4. Input OTP email baru &rarr; konfirmasi & update email, sinkronisasi state user via `fetchMe()`.
- Dilarang menaruh form ganti email langsung hanya bermodalkan password tanpa verifikasi inbox email lama.

## Language & Theme Controls (Berdampingan)

- Seluruh layout dashboard (`AppShell` topbar) dan seluruh halaman autentikasi (`/auth/*` di pojok kanan atas) **wajib memiliki `LanguageSwitcher` dan `ThemeToggle` yang saling berdampingan**.
- Pilihan bahasa disimpan ke cookie `locale`, pilihan tema disimpan ke cookie `theme` (1 tahun) dan `localStorage` — **tanpa menyimpan ke DB**.

