# Agile Scrum Roadmap - Sprint Backlog

**Estimasi**: 8 Sprint (Setiap sprint berdurasi 2 minggu)
**Total Estimasi**: 16 Minggu (Development phase)

---

## Sprint 1: Foundation & Core Authentication
**Sprint Goal**: Menyiapkan arsitektur dasar sistem, konfigurasi CI/CD, database schema utama, integrasi caching, serta modul Authentication dan Role-Based Access Control (RBAC).

**Backend (BE) & DevOps:**
- **BE-01**: Inisialisasi project Express.js dengan arsitektur modular.
- **BE-02**: Setup PostgreSQL database, ORM, dan inisiasi migrasi awal.
- **BE-03**: Setup Redis (caching) dan Worker Queue (BullMQ/RabbitMQ).
- **BE-04**: Implementasi tabel `users`, `roles`, dan `audit_logs`.
- **BE-05**: Auth API (Register, Login, Refresh Token, Logout).
- **BE-06**: Middleware RBAC & pencatatan Audit Log otomatis (login/register).
- **DO-01**: Setup Dockerfile, docker-compose, CI/CD pipeline dasar, provision DB dev.

**Frontend (FE):**
- **FE-01**: Setup React Vite, Tailwind CSS, Zustand, TanStack Query.
- **FE-02**: Konfigurasi routing & API interceptors (Axios).
- **FE-03**: UI/UX Halaman Login & Registrasi Penyewa.
- **FE-04**: Layout Dashboard berdasarkan role (Penyewa, Admin, Pimpinan).

---

## Sprint 2: Master Data Aset & Ketersediaan
**Sprint Goal**: Implementasi manajemen data aset termasuk upload media, ketersediaan kalender, dan struktur harga yang fleksibel.

**Backend (BE):**
- **BE-07**: Skema dan endpoint CRUD `asset_categories`.
- **BE-08**: Skema dan endpoint CRUD `assets` (termasuk validasi field pricing dinamis: jam/hari/minggu/bulan/tahun).
- **BE-09**: API Upload foto/dokumen untuk `asset_media`.
- **BE-10**: API cek ketersediaan aset (Calendar / Date Blocking).
- **BE-11**: Implementasi caching Redis pada query Master Data Aset.

**Frontend (FE):**
- **FE-05**: UI/UX Dashboard Admin - Manajemen Kategori Aset.
- **FE-06**: UI/UX Dashboard Admin - Form Tambah/Edit Aset (termasuk dinamis pricing).
- **FE-07**: UI/UX Dashboard Admin - Upload foto/dokumen aset.
- **FE-08**: UI/UX Penyewa - Halaman Katalog Aset dan Detail Aset.
- **FE-09**: UI/UX Penyewa - Tampilan Kalender Ketersediaan.

---

## Sprint 3: Pengajuan Penyewaan & Dokumen Syarat
**Sprint Goal**: Membangun flow bagi penyewa untuk mengajukan permohonan penyewaan aset, menyimpan draft, dan mengunggah dokumen persyaratan.

**Backend (BE):**
- **BE-12**: Skema tabel `rental_requests` dan `rental_request_documents`.
- **BE-13**: API Create draft pengajuan penyewaan.
- **BE-14**: API Upload dokumen persyaratan penyewaan.
- **BE-15**: API Submit pengajuan penyewaan (mengubah status dari draft ke submitted).
- **BE-16**: Logic validasi ketersediaan aset saat form di-submit (mencegah double booking).

**Frontend (FE):**
- **FE-10**: UI/UX Penyewa - Form Pengajuan Penyewaan (Step-by-step wizard/draft).
- **FE-11**: UI/UX Penyewa - Form Upload dokumen kelengkapan.
- **FE-12**: UI/UX Penyewa - List riwayat pengajuan dan statusnya.

---

## Sprint 4: Verifikasi Admin & Workflow Approval Pimpinan
**Sprint Goal**: Mengimplementasikan workflow persetujuan, verifikasi dokumen oleh admin, hingga keputusan (Approve/Reject/Revision) dari Pimpinan.

**Backend (BE):**
- **BE-17**: Skema `approvals` dan `status_history`.
- **BE-18**: API Verifikasi dokumen oleh Admin (Ubah ke `Under Verification` -> `Pending Approval`).
- **BE-19**: API Keputusan Pimpinan (Approve / Reject / Revision).
- **BE-20**: Notifikasi in-app / sistem terpicu berdasarkan perubahan status.

**Frontend (FE):**
- **FE-13**: UI/UX Admin - Daftar pengajuan masuk (In-tray) dan halaman review dokumen.
- **FE-14**: UI/UX Admin - Modal konfirmasi teruskan ke Pimpinan beserta catatan.
- **FE-15**: UI/UX Pimpinan - Daftar pengajuan menunggu persetujuan.
- **FE-16**: UI/UX Pimpinan - Fitur setujui, tolak, atau minta revisi dengan form catatan wajib.
- **FE-17**: UI/UX Penyewa - Tampilan feedback revisi jika ada penolakan/revisi dari pimpinan.

---

## Sprint 5: Invoice Generation & Manual VA
**Sprint Goal**: Otomatisasi pembuatan tagihan (Invoice) berformat PDF profesional, penambahan biaya utilitas manual, dan input rekening/VA.

**Backend (BE):**
- **BE-21**: Skema `invoices` (subtotal, pajak, biaya utilitas, VA manual).
- **BE-22**: API Generate Invoice (dieksekusi admin ketika status Approved).
- **BE-23**: Integrasi Background Worker untuk rendering PDF Invoice (Template Profesional).
- **BE-24**: API Update/Add biaya utilitas manual oleh Admin.
- **BE-25**: API Input Manual Nomor Virtual Account / Rekening pembayaran.

**Frontend (FE):**
- **FE-18**: UI/UX Admin - Modul Pembuatan Invoice per Pengajuan.
- **FE-19**: UI/UX Admin - Form input tagihan tambahan (listrik/air) dan nomor VA bayar.
- **FE-20**: UI/UX Penyewa - Notifikasi tagihan baru dan fitur Download PDF Invoice.

---

## Sprint 6: Pembayaran, Verifikasi Pembayaran & Kontrak
**Sprint Goal**: Alur penyewa melakukan konfirmasi pembayaran, admin memverifikasi, serta pembuatan dokumen kontrak.

**Backend (BE):**
- **BE-26**: Skema `payments` dan `contracts`.
- **BE-27**: API Penyewa Upload Bukti Transfer ke sistem.
- **BE-28**: API Admin Verifikasi Bukti Pembayaran (Valid/Invalid).
- **BE-29**: API Generate Kontrak Sewa PDF via Background Worker (Placeholder text dinamis).

**Frontend (FE):**
- **FE-21**: UI/UX Penyewa - Form unggah bukti transfer.
- **FE-22**: UI/UX Admin - Daftar tunggu verifikasi pembayaran dan approval pembayaran.
- **FE-23**: UI/UX Admin - Tombol generate dan review kontrak.
- **FE-24**: UI/UX Penyewa - Fitur download dokumen kontrak akhir.

---

## Sprint 7: Additional Assets & Import Excel
**Sprint Goal**: Mengembangkan fitur import data Excel untuk kebutuhan transaksi keuangan dan pengelolaan daftar "Additional Assets".

**Backend (BE):**
- **BE-30**: Skema `additional_assets`.
- **BE-31**: Endpoint dan Worker pemrosesan unggahan file Excel Transaksi Keuangan (Parsing & Validasi).
- **BE-32**: Endpoint dan Worker pemrosesan unggahan file Excel Additional Assets.
- **BE-33**: Cron Job / Scheduler untuk otomatis men-set status "Completed" jika waktu sewa habis.

**Frontend (FE):**
- **FE-25**: UI/UX Admin - Menu Import Transaksi (Upload file .xlsx, preview parsing error).
- **FE-26**: UI/UX Admin - Menu Additional Assets (Upload Excel, list data tersimpan).
- **FE-27**: UI/UX Semua Aktor - Finalisasi daftar riwayat dengan status "Completed".

---

## Sprint 8: Reporting, Dashboard, & Production Readiness
**Sprint Goal**: Mematangkan visualisasi data (Dashboard), laporan komprehensif, penyempurnaan Audit Log, dan persiapan UAT/Go-Live.

**Backend (BE):**
- **BE-34**: API Summary Dashboard (Penyewa, Admin, Pimpinan).
- **BE-35**: API Export Laporan Operasional & Keuangan (CSV/Excel).
- **BE-36**: Endpoint pencarian/filter data Audit Log (User, Modul, Rentang Waktu).
- **BE-37**: Security Hardening, Rate Limiting, optimasi index DB, sanitasi endpoint.

**Frontend (FE):**
- **FE-28**: UI/UX Dashboard Interaktif (Chart/Grafik utilisasi aset, pendapatan).
- **FE-29**: UI/UX Halaman Reporting (Filter custom dan tombol Download Report).
- **FE-30**: UI/UX Admin - Tampilan log audit sistem.
- **FE-31**: Bug fixing, finalisasi responsivitas mobile, dan perbaikan UX feedback.

---

*Catatan: Item dalam backlog ini dapat disesuaikan bobotnya saat Sprint Planning, dan jika terdapat task yang lebih besar dapat dipecah menjadi sub-task harian.*
