# Dokumen Perencanaan Proyek  
## Sistem Manajemen Aset Kampus  
### SRS + Technical Architecture (React Vite + Express + PostgreSQL)

## 1. Executive Summary
Sistem Manajemen Aset Kampus adalah platform web end-to-end untuk mengelola siklus penyewaan aset kampus dari pencarian aset hingga penyewaan selesai. Sistem ini menstandardisasi proses bisnis yang saat ini kemungkinan manual/semi-manual menjadi proses digital terkontrol dengan status workflow yang jelas, approval berjenjang, jejak audit, dan pelaporan manajerial.

**Nilai bisnis utama:**
- Meningkatkan transparansi proses pengajuan dan approval.
- Mempercepat siklus administrasi (verifikasi, invoice, kontrak, validasi pembayaran).
- Mengurangi risiko human error melalui workflow terstruktur.
- Menyediakan data real-time untuk pengambilan keputusan pimpinan.
- Meningkatkan pengalaman penyewa internal maupun eksternal.

**Outcome target 6-12 bulan:**
- Waktu proses pengajuan sampai approval turun 40-60%.
- SLA verifikasi admin dan validasi pembayaran terukur.
- Laporan keuangan/operasional penyewaan tersedia otomatis.
- Kepatuhan administratif meningkat melalui audit trail.

---

## 2. Business Process Analysis

### 2.1 As-Is (umum terjadi)
- Data aset tersebar di spreadsheet/dokumen.
- Approval dilakukan via chat/email tanpa tracking status baku.
- Invoice/kontrak dibuat manual, rawan mismatch data.
- Sulit memonitor aset terpakai, pending, atau idle.
- Tidak ada single source of truth.

### 2.2 To-Be (proses target)
- Seluruh aset terdaftar dalam master data terpusat.
- Pengajuan berjalan via form digital dengan upload dokumen.
- Workflow approval berbasis status dan role.
- Invoice dan kontrak di-generate otomatis dari template.
- Pembayaran diverifikasi admin dan tercatat ke transaksi.
- Dashboard real-time untuk pimpinan/admin.

### 2.3 KPI Proses
- Lead time per status.
- Approval turnaround time pimpinan.
- Rasio approve/reject/revision.
- Nilai pendapatan sewa per periode.
- Utilization rate aset.
- Rasio keterlambatan pembayaran.

---

## 3. Workflow Approval Diagram (Deskripsi Tekstual)

### 3.1 State Flow Utama
1. `Draft`  
2. `Submitted`  
3. `Under Verification`  
4. `Pending Approval`  
5. `Approved` atau `Rejected` atau `Revision Requested`  
6. Jika `Revision Requested` -> kembali ke `Submitted` setelah revisi  
7. Jika `Approved` -> `Invoice Generated` -> `Contract Generated` -> `Waiting Payment`  
8. Penyewa upload bukti bayar -> `Payment Verification`  
9. Jika pembayaran valid -> `Active Rental`  
10. Setelah tanggal akhir sewa -> `Completed`  
11. Dapat `Cancelled` pada kondisi tertentu sesuai policy.

### 3.2 Aturan Transisi Inti
- Hanya admin dapat pindah dari `Submitted` ke `Under Verification`.
- Hanya admin dapat kirim ke `Pending Approval`.
- Hanya pimpinan dapat set `Approved/Rejected/Revision Requested`.
- Hanya admin dapat generate invoice/kontrak.
- Hanya admin dapat memvalidasi pembayaran.
- Perubahan status wajib menyimpan actor, timestamp, note di audit log.

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization
- Registrasi penyewa.
- Login berbasis email/password.
- JWT access token + refresh token.
- RBAC: `PIMPINAN`, `ADMIN_ASET`, `PENYEWA`.
- Password reset dan logout all sessions (opsional tahap 2).

### 4.2 Master Data Aset
- CRUD aset.
- Klasifikasi jenis aset.
- Upload foto dan dokumen aset.
- Status ketersediaan dan kapasitas.
- Pricing per aset yang fleksibel (opsi tarif per jam/hari/minggu/bulan/tahun). Harga untuk setiap unit durasi dapat diset berbeda-beda secara spesifik untuk masing-masing aset.

### 4.3 Ketersediaan & Kalender
- Kalender booking per aset.
- Cek konflik jadwal otomatis.
- Blocking date untuk maintenance/internal event.

### 4.4 Pengajuan Penyewaan
- Form pengajuan detail penggunaan.
- Upload dokumen persyaratan.
- Validasi field wajib.
- Simpan draft sebelum submit.

### 4.5 Approval Workflow
- In-tray admin dan pimpinan.
- Approve/reject/revision dengan catatan wajib.
- Riwayat status lengkap.

### 4.6 Invoice Management
- Generate nomor invoice otomatis.
- Hitung subtotal, pajak, denda, total.
- Dukungan penambahan biaya utilitas (seperti tagihan listrik dan air) yang diinput dan di-upload manual oleh admin, khususnya untuk sewa jangka panjang (bulanan/tahunan).
- Status invoice: unpaid/paid/overdue.
- Export PDF dengan template yang sangat profesional, rapi, dan sesuai dengan standar industri (high-quality invoice design).

### 4.7 Contract Management
- Template kontrak berbasis placeholder.
- Auto-fill data aset, penyewa, periode, nilai sewa.
- Versioning kontrak.
- Download PDF.

### 4.8 Payment Management
- Admin akan menginput nomor Virtual Account (VA) secara manual per transaksi.
- Penyewa membayar ke VA tujuan yang telah diberikan.
- Penyewa upload bukti transfer.
- Verifikasi admin (valid/invalid/need-reupload) dengan mengecek pembayaran di VA secara manual.
- Catat tanggal bayar, nominal, bank, referensi.

### 4.9 Document Management
- Penyimpanan dokumen pengajuan/invoice/kontrak/bukti bayar.
- Metadata dokumen.
- Hak akses dokumen per role.

### 4.10 Dashboard & Reporting
- KPI operasional dan finansial.
- Filter per rentang tanggal, jenis aset, unit.
- Export laporan (CSV/PDF).

### 4.11 Notifications
- In-app notification.
- Email notification untuk event kritikal (submit, approval, invoice, payment status).

### 4.12 Audit Log
- Log semua aksi sensitif, aktivitas user, dan setiap perubahan data dalam sistem secara komprehensif.
- Diperlukan untuk kebutuhan audit trail.
- Pencarian berdasarkan user, modul, tanggal, entity.

### 4.13 Settings
- Konfigurasi template invoice/kontrak.
- Konfigurasi pajak dan penomoran dokumen.
- Konfigurasi SLA proses.

### 4.14 Fitur Additional Asset & Import Data
- Menu khusus (feature) untuk mengelola "Additional Asset" yang akan dikembangkan setelah flow utama sewa aset selesai.
- Fitur import data dari Excel untuk menambahkan/mengupdate additional asset (format menyusul).
- Fitur upload dan parsing Excel untuk import data transaksi keuangan (diperlukan untuk kebutuhan rekonsiliasi nantinya).

---

## 5. Non-Functional Requirements
- Availability target: 99.5% bulanan.
- Performance: p95 API response < 500 ms untuk endpoint utama. Menggunakan **Redis** untuk implementasi caching (master data, konfigurasi, dll).
- Scalability: stateless API horizontal scaling.
- Background Processing: Menggunakan **Worker** untuk tugas asinkron seperti pembuatan PDF, pengiriman email, dan parsing file Excel besar.
- Security: OWASP Top 10 baseline control.
- Reliability: transactional consistency untuk status + finance.
- Maintainability: modular architecture, linting, code review.
- Observability: structured logging + metrics + tracing readiness.
- Backup: backup DB harian + retensi minimal 30 hari.
- Compliance: audit trail immutable untuk aksi kritikal.
- Usability: responsive UI desktop/mobile, bahasa Indonesia.

---

## 6. Use Case Diagram (Deskripsi)

### 6.1 Aktor
- Penyewa
- Admin Manajemen Aset
- Pimpinan
- Sistem Notifikasi (aktor eksternal sistem)

### 6.2 Use Case Utama per Aktor
- Penyewa: registrasi, login, lihat aset, ajukan sewa, upload dokumen, lihat status, download invoice/kontrak, upload bukti bayar.
- Admin: kelola aset, verifikasi pengajuan, kirim approval, generate invoice, generate kontrak, verifikasi pembayaran, generate laporan.
- Pimpinan: review pengajuan, approve/reject/revision, lihat dashboard.
- Sistem Notifikasi: kirim notifikasi berbasis event workflow.

---

## 7. User Stories

### 7.1 Penyewa
- Sebagai penyewa, saya ingin melihat daftar aset dan jadwal ketersediaannya agar saya dapat memilih aset yang sesuai.
- Sebagai penyewa, saya ingin menyimpan draft pengajuan agar dapat melengkapi data secara bertahap.
- Sebagai penyewa, saya ingin memantau status pengajuan secara real-time agar mengetahui tahapan proses.
- Sebagai penyewa, saya ingin menerima invoice dan kontrak dalam format PDF agar mudah diproses administrasi.
- Sebagai penyewa, saya ingin upload bukti pembayaran agar proses aktivasi sewa bisa dilanjutkan.

### 7.2 Admin
- Sebagai admin, saya ingin memverifikasi kelengkapan dokumen agar hanya pengajuan valid yang diproses.
- Sebagai admin, saya ingin mengirim pengajuan ke pimpinan agar proses approval berjalan terstruktur.
- Sebagai admin, saya ingin generate invoice dan kontrak otomatis agar meminimalkan kesalahan manual.
- Sebagai admin, saya ingin memvalidasi pembayaran agar status sewa akurat.
- Sebagai admin, saya ingin menghasilkan laporan periodik agar evaluasi operasional lebih cepat.

### 7.3 Pimpinan
- Sebagai pimpinan, saya ingin melihat ringkasan pengajuan pending agar dapat memprioritaskan keputusan.
- Sebagai pimpinan, saya ingin memberikan keputusan approve/reject/revision dengan catatan agar alasan keputusan terdokumentasi.
- Sebagai pimpinan, saya ingin melihat dashboard performa penyewaan agar keputusan strategis berbasis data.

---

## 8. Acceptance Criteria (Sample Inti)

### 8.1 Pengajuan Penyewaan
- Given penyewa sudah login, when mengisi form valid dan submit, then status menjadi `Submitted`.
- Given data wajib belum lengkap, when submit, then sistem menolak dan menampilkan error field.

### 8.2 Verifikasi Admin
- Given pengajuan `Submitted`, when admin memulai verifikasi, then status menjadi `Under Verification`.
- Given pengajuan valid, when admin kirim ke pimpinan, then status menjadi `Pending Approval`.

### 8.3 Approval Pimpinan
- Given status `Pending Approval`, when pimpinan klik approve, then status menjadi `Approved`.
- Given pimpinan pilih revision, then status `Revision Requested` dan catatan wajib terisi.
- Given pimpinan reject, then status `Rejected` dan proses berhenti kecuali pengajuan baru.

### 8.4 Invoice & Kontrak
- Given pengajuan `Approved`, when admin generate invoice, then invoice number unik dan status `Invoice Generated`.
- Given invoice tersedia, when admin generate kontrak, then kontrak PDF tersimpan dan status `Contract Generated`.

### 8.5 Pembayaran
- Given status `Waiting Payment`, when penyewa upload bukti transfer, then status `Payment Verification`.
- Given bukti valid, when admin approve payment, then status `Active Rental`.

### 8.6 Completion
- Given rental aktif melewati end date, when job scheduler berjalan, then status berubah `Completed`.

---

## 9. Entity Relationship Diagram (ERD) - Deskripsi

### 9.1 Entitas Utama
- users
- roles
- assets
- asset_categories
- asset_availability
- rental_requests
- rental_request_documents
- approvals
- invoices
- contracts
- payments
- notifications
- audit_logs
- settings
- status_history

### 9.2 Relasi Inti
- Satu role memiliki banyak users.
- Satu asset_category memiliki banyak assets.
- Satu asset memiliki banyak slot availability.
- Satu user penyewa memiliki banyak rental_requests.
- Satu rental_request memiliki banyak documents.
- Satu rental_request memiliki banyak approvals (riwayat keputusan).
- Satu rental_request memiliki maksimal satu invoice aktif.
- Satu rental_request memiliki maksimal satu contract aktif.
- Satu invoice dapat memiliki satu atau lebih payment attempt.
- Semua perubahan status rental_request masuk status_history.
- Semua aksi sensitif user masuk audit_logs.

---

## 10. Database Schema (PostgreSQL, Ringkas)

### 10.1 Tabel Kunci
- `roles(id, code, name, created_at, updated_at)`
- `users(id, role_id, full_name, email, password_hash, phone, organization, is_active, created_at, updated_at)`
- `asset_categories(id, code, name, description, created_at, updated_at)`
- `assets(id, asset_code, category_id, name, location, capacity, facilities_json, pricing_scheme_json, availability_status, description, created_at, updated_at)`
- `asset_media(id, asset_id, media_type, file_url, created_at)`
- `additional_assets(id, asset_code, name, details_json, imported_from_excel, created_at, updated_at)`
- `rental_requests(id, request_no, tenant_user_id, asset_id, event_name, start_datetime, end_datetime, participant_count, purpose, status, submitted_at, created_at, updated_at)`
- `rental_request_documents(id, request_id, doc_type, file_url, verified_by, verified_at, verification_note, created_at)`
- `approvals(id, request_id, approver_user_id, action, note, acted_at, created_at)`
- `invoices(id, request_id, invoice_no, issue_date, due_date, subtotal, utility_costs_json, tax_amount, penalty_amount, total_amount, manual_va_number, status, pdf_url, created_at, updated_at)`
- `contracts(id, request_id, contract_no, signed_date, start_date, end_date, contract_value, pdf_url, version, created_at, updated_at)`
- `payments(id, invoice_id, payer_user_id, amount, transfer_date, proof_url, verification_status, verified_by, verified_at, verification_note, created_at, updated_at)`
- `status_history(id, request_id, from_status, to_status, changed_by, note, changed_at)`
- `notifications(id, user_id, notif_type, title, message, is_read, created_at)`
- `audit_logs(id, actor_user_id, module, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent, created_at)`
- `settings(id, setting_key, setting_value_json, updated_by, updated_at)`

### 10.2 Index dan Constraint
- Unique: email, asset_code, request_no, invoice_no, contract_no.
- Foreign key wajib pada relasi utama.
- Index: `rental_requests(status, start_datetime)`, `invoices(status, due_date)`, `audit_logs(created_at, module)`.
- Check constraint: end_datetime > start_datetime.
- Enum/table reference untuk status workflow.

---

## 11. REST API Endpoints (Versi v1)

### 11.1 Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### 11.2 Users & Roles
- `GET /api/v1/users` (admin/pimpinan)
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `GET /api/v1/roles`

### 11.3 Assets
- `GET /api/v1/assets`
- `POST /api/v1/assets` (admin)
- `GET /api/v1/assets/:id`
- `PATCH /api/v1/assets/:id` (admin)
- `DELETE /api/v1/assets/:id` (admin)
- `POST /api/v1/assets/:id/media` (admin)
- `GET /api/v1/assets/:id/availability`

### 11.4 Additional Assets & Import
- `POST /api/v1/additional-assets/import` (admin)
- `POST /api/v1/transactions/import` (admin)

### 11.4 Rental Requests
- `GET /api/v1/rental-requests`
- `POST /api/v1/rental-requests` (penyewa)
- `GET /api/v1/rental-requests/:id`
- `PATCH /api/v1/rental-requests/:id` (penyewa saat draft/revision)
- `POST /api/v1/rental-requests/:id/submit`
- `POST /api/v1/rental-requests/:id/verify` (admin)
- `POST /api/v1/rental-requests/:id/send-approval` (admin)
- `POST /api/v1/rental-requests/:id/approve` (pimpinan)
- `POST /api/v1/rental-requests/:id/reject` (pimpinan)
- `POST /api/v1/rental-requests/:id/request-revision` (pimpinan)
- `POST /api/v1/rental-requests/:id/cancel`

### 11.5 Documents
- `POST /api/v1/rental-requests/:id/documents`
- `GET /api/v1/rental-requests/:id/documents/:docId/download`

### 11.6 Invoice & Contract
- `POST /api/v1/rental-requests/:id/invoices/generate` (admin)
- `GET /api/v1/invoices/:id`
- `GET /api/v1/invoices/:id/download`
- `POST /api/v1/rental-requests/:id/contracts/generate` (admin)
- `GET /api/v1/contracts/:id`
- `GET /api/v1/contracts/:id/download`

### 11.7 Payments
- `POST /api/v1/invoices/:id/payments/upload-proof` (penyewa)
- `POST /api/v1/payments/:id/verify` (admin)
- `POST /api/v1/payments/:id/reject` (admin)

### 11.8 Dashboard, Reports, Audit
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/reports/rentals`
- `GET /api/v1/reports/revenue`
- `GET /api/v1/audit-logs`

---

## 12. Backend Folder Structure (Express.js)

```text
backend-service
├─ src
│  ├─ app
│  │  ├─ server.js
│  │  ├─ app.js
│  │  └─ routes.js
│  ├─ config
│  │  ├─ env.js
│  │  ├─ db.js
│  │  ├─ logger.js
│  │  └─ constants.js
│  ├─ modules
│  │  ├─ auth
│  │  ├─ users
│  │  ├─ assets
│  │  ├─ rental-requests
│  │  ├─ approvals
│  │  ├─ invoices
│  │  ├─ contracts
│  │  ├─ payments
│  │  ├─ notifications
│  │  ├─ reports
│  │  └─ audit-logs
│  ├─ middleware
│  │  ├─ authJwt.js
│  │  ├─ rbac.js
│  │  ├─ validateRequest.js
│  │  ├─ errorHandler.js
│  │  └─ rateLimiter.js
│  ├─ shared
│  │  ├─ utils
│  │  ├─ validators
│  │  ├─ errors
│  │  └─ dto
│  ├─ jobs
│  │  ├─ completeRentalJob.js
│  │  ├─ reminderJob.js
│  │  ├─ generatePdfWorker.js
│  │  └─ processExcelWorker.js
│  └─ tests
│     ├─ unit
│     ├─ integration
│     └─ e2e
├─ prisma or migrations
└─ Dockerfile
```

---

## 13. Frontend Folder Structure (React + Vite)

```text
frontend-service
├─ src
│  ├─ app
│  │  ├─ router.jsx
│  │  ├─ providers.jsx
│  │  └─ queryClient.js
│  ├─ pages
│  │  ├─ auth
│  │  ├─ dashboard
│  │  ├─ assets
│  │  ├─ rental-requests
│  │  ├─ approvals
│  │  ├─ invoices
│  │  ├─ contracts
│  │  ├─ payments
│  │  ├─ reports
│  │  └─ settings
│  ├─ features
│  │  ├─ auth
│  │  ├─ assets
│  │  ├─ rental
│  │  ├─ billing
│  │  └─ reporting
│  ├─ components
│  │  ├─ ui
│  │  ├─ forms
│  │  ├─ tables
│  │  └─ layout
│  ├─ services
│  │  ├─ httpClient.js
│  │  └─ endpoints.js
│  ├─ store
│  │  ├─ authStore.js
│  │  ├─ uiStore.js
│  │  └─ filterStore.js
│  ├─ hooks
│  ├─ utils
│  ├─ styles
│  └─ tests
│     ├─ unit
│     ├─ component
│     └─ e2e
└─ Dockerfile
```

---

## 14. Security Design
- JWT short-lived access token dan refresh token rotation.
- Password hashing dengan Argon2 atau bcrypt cost tinggi.
- RBAC enforcement di middleware + service layer.
- Input validation (schema-based) semua endpoint.
- SQL injection protection via parameterized query/ORM.
- File upload hardening: type whitelist, size limit, malware scanning hook.
- Secure headers (Helmet), CORS strict, rate limiting.
- Audit log untuk login, approval, finance, settings.
- Secrets di environment variable/secret manager, bukan di source code.
- Backup encryption dan TLS in-transit.

---

## 15. Invoice Generation Design
- Template engine untuk invoice HTML -> PDF renderer. Desain dibuat sangat profesional dan rapi (high quality layout).
- Mampu menampilkan biaya tambahan utilitas (listrik, air, dsb) jika diinput/di-upload manual oleh admin (terutama sewa jangka panjang).
- Menampilkan nomor Virtual Account (VA) secara eksplisit untuk instruksi pembayaran.
- Nomor invoice format: `INV/{YEAR}/{MONTH}/{SEQ}`.
- Komponen perhitungan: subtotal, utility_costs, tax, penalty, total.
- Snapshot invoice data disimpan agar tidak berubah walau master data berubah.
- Re-generate PDF tanpa mengubah nilai finansial.
- Event trigger notifikasi ketika invoice diterbitkan.

---

## 16. Contract Generation Design
- Template kontrak legal terstandar dengan placeholder.
- Data auto-fill: identitas penyewa, detail aset, periode, nilai, klausul.
- Versioning kontrak: `v1`, `v2` jika revisi legal.
- Storage kontrak immutable setelah final.
- Tanda tangan digital dapat jadi roadmap fase berikutnya.
- Audit siapa generate, kapan, berdasarkan request mana.

---

## 17. Reporting Design

### 17.1 Laporan Operasional
- Jumlah pengajuan per status.
- SLA verifikasi dan approval.
- Utilisasi aset per jenis/lokasi.

### 17.2 Laporan Keuangan
- Pendapatan sewa per periode.
- Outstanding invoice.
- Tren pembayaran on-time vs overdue.

### 17.3 Laporan Manajerial
- Top aset dengan pendapatan tertinggi.
- Rasio reject/revision per unit.
- Forecast demand sederhana berdasarkan historis.

---

## 18. Agile Scrum Roadmap per Sprint (2 Minggu/Sprint)

1. Sprint 1: Foundation, auth, RBAC, baseline CI, setup DB schema inti.
2. Sprint 2: Master data aset + media + kalender availability.
3. Sprint 3: Pengajuan penyewaan + upload dokumen + status history.
4. Sprint 4: Verifikasi admin + approval pimpinan + notifikasi.
5. Sprint 5: Invoice generation + PDF + workflow billing.
6. Sprint 6: Contract generation + PDF + integrasi workflow.
7. Sprint 7: Payment upload/verification + dashboard utama.
8. Sprint 8: Reporting, audit log, hardening, UAT, production readiness.

---

## 19. Timeline Estimation

| Fase | Durasi | Deliverable |
|---|---:|---|
| Discovery & Detail Requirement | 2 minggu | BRD, SRS final, backlog |
| Architecture & Setup | 1 minggu | baseline repo, CI/CD, env |
| Development (8 sprint) | 16 minggu | fitur core + stabilisasi |
| UAT & Training | 2 minggu | sign-off pengguna |
| Go-Live & Hypercare | 2 minggu | support awal produksi |

**Total estimasi:** 23 minggu (sekitar 5-6 bulan).

---

## 20. Team Roles and Responsibilities
- Project Manager: perencanaan, risiko, stakeholder, delivery governance.
- Business Analyst: requirement elicitation, use case, acceptance alignment.
- Solution Architect: desain arsitektur, standar integrasi, security baseline.
- Backend Engineers: API, workflow engine, DB, file, reporting backend.
- Frontend Engineers: UI flow role-based, form kompleks, dashboard.
- QA Engineer: test strategy, automation, regression.
- DevOps Engineer: Docker, CI/CD, environment, observability.
- UI/UX Designer: design system, usability, prototyping.
- Product Owner: prioritas backlog dan acceptance keputusan bisnis.

---

## 21. Testing Strategy
- Unit test: service, util, validator, state store.
- Integration test: API + DB + auth + workflow transitions.
- E2E test: skenario user utama lintas role.
- Contract/API test: memastikan kompatibilitas endpoint.
- Performance test: endpoint list/filter/reporting.
- Security test: auth bypass, injection, upload abuse, IDOR.
- UAT checklist berbasis acceptance criteria bisnis.
- Regression suite dijalankan di pipeline sebelum release.

---

## 22. Deployment Strategy
- Dockerized frontend dan backend.
- Environment: dev, staging, production.
- GitHub Actions:
  - lint + test + build
  - security scan dependencies
  - image build + push registry
  - deploy ke staging otomatis
  - production via manual approval gate
- Database migration dijalankan terkontrol saat deploy.
- Blue/green atau rolling update untuk minim downtime.

---

## 23. Monitoring and Logging
- Structured logging JSON.
- Correlation ID per request.
- Metrics: response time, error rate, throughput, queue/job health.
- Alerting: API error spike, DB connection saturation, payment verification failure rate.
- Audit dashboard untuk aktivitas sensitif.
- Retensi log disesuaikan kebijakan institusi.

---

## 24. Risk Assessment

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| Requirement berubah saat development | Tinggi | Sedang | grooming rutin, change control |
| Kompleksitas approval dan legal kontrak | Tinggi | Sedang | prototyping awal, review legal berkala |
| Kualitas data awal aset rendah | Sedang | Tinggi | fase data cleansing + import validation |
| Keterlambatan UAT stakeholder | Sedang | Sedang | jadwal UAT disepakati sejak awal |
| Kerentanan keamanan file upload | Tinggi | Sedang | scanning, whitelist, isolation storage |
| Beban laporan tinggi | Sedang | Sedang | indexing, query optimization, caching |

---

## 25. MVP Scope
- Auth + RBAC lengkap 3 role.
- Master data aset + availability dasar.
- Pengajuan penyewaan + dokumen.
- Verifikasi admin + approval pimpinan.
- Generate invoice & kontrak PDF.
- Upload dan verifikasi pembayaran.
- Dashboard ringkas dan laporan dasar.
- Audit log inti.

---

## 26. Feature Prioritization

### Must Have
- Auth RBAC.
- Asset management.
- Rental request workflow.
- Approval berjenjang.
- Invoice & contract generation.
- Payment verification.
- Audit log dasar.
- Dashboard dan laporan dasar.

### Should Have
- Notifikasi email.
- SLA tracking detail.
- Advanced filtering laporan.
- Reminder otomatis jatuh tempo.

### Nice to Have
- Integrasi payment gateway.
- E-signature kontrak.
- Predictive analytics demand.
- Mobile app companion.

---

## 27. Future Enhancements
- Integrasi SSO kampus.
- Integrasi ERP/akuntansi kampus.
- Integrasi QR check-in aset saat hari penggunaan.
- Dynamic pricing berdasarkan kalender/event.
- Multi-campus/multi-tenant mode.
- AI-assisted anomaly detection untuk fraud pembayaran.
- Self-service analytics dengan custom report builder.

---

## Rekomendasi Arsitektur Implementasi Stack Anda
- Frontend: React Vite + Tailwind + TanStack Query + Zustand dengan feature-based modular structure.
- Backend: Express modular per domain, service-repository pattern, validation layer terpisah.
- Background Worker: Redis + BullMQ (atau message queue sejenis) untuk task asinkron.
- Caching: Redis untuk mempercepat akses data master dan konfigurasi.
- DB: PostgreSQL dengan migrasi versioned, index strategy sejak awal.
- Security: JWT + refresh rotation + audit trail komprehensif.
- DevOps: Docker per service + GitHub Actions untuk CI/CD multi-env.

Jika Anda ingin, langkah berikutnya saya bisa langsung lanjutkan ke artefak implementasi praktis:
1. Product Backlog rinci (epic > feature > user story > task) siap impor ke Jira/Trello.  
2. Spesifikasi API detail per endpoint (request/response JSON, error codes).  
3. Draft SQL DDL awal dan seed role-status agar tim backend bisa mulai coding segera.