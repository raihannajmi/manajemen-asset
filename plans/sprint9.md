# Gap Analysis & Sprint 9+ Implementation Plan

## Keputusan yang Sudah Dikonfirmasi

| Topik | Keputusan |
|---|---|
| **Schema Form** | Tiap aset punya schema sendiri (pending konfirmasi stakeholder) |
| **File Storage** | Cloudflare R2 — credentials menyusul |
| **PDF Generation** | Async (background job), tampilkan status "sedang diproses" di UI |
| **Alur Invoice + Kontrak** | Diperbaiki ✅ — sekarang: `APPROVED → Invoice → Kontrak → WAITING_PAYMENT → ACTIVE_RENTAL` |

---

## Alur Rental Lifecycle yang Sudah Diperbaiki

```
[PENYEWA] Draft → Submit
[ADMIN]   Submitted → Verifikasi & Teruskan ke Pimpinan
[PIMPINAN] Pending Approval → Approve / Reject / Revision
[ADMIN]   Approved → Generate Invoice → INVOICE_GENERATED
[ADMIN]   Invoice Generated → Terbitkan Kontrak → WAITING_PAYMENT
[PENYEWA] Waiting Payment → Upload Bukti Bayar
[ADMIN]   Verifikasi Pembayaran → ACTIVE_RENTAL
[SISTEM]  Active Rental + end_date tercapai → COMPLETED
```

---

## Backlog Sprint 9: Core Foundation Gaps (P1)

### 1. Validation Layer (3-Layer)

**Priority: 🔴 P1 — Wajib sebelum production**

#### Backend (Joi)
- Install `joi` di backend
- Buat middleware `validateRequest(schema)` di `src/middleware/`
- Buat schema Joi untuk:
  - `POST /rentals` — startDatetime harus sebelum endDatetime, participantCount > 0
  - `POST /auth/register` — email format valid, password min 8 char
  - `POST /assets` — assetCode format, capacity > 0
  - `POST /invoices` — totalAmount > 0

#### Frontend (React Hook Form + Zod)
- Install `react-hook-form` dan `zod`
- Migrasi form prioritas:
  - `BookAsset.jsx` — validasi tanggal, durasi minimal
  - `Register.jsx` — validasi email, konfirmasi password
  - `AssetManagement.jsx` — validasi field aset

---

### 2. Pricing Engine

**Priority: 🔴 P1 — Keuangan sistem**

#### Schema `pricing_scheme_json` di tabel `assets`
```json
{
  "unit": "hour",
  "base_price": 500000,
  "tiers": [
    { "min_units": 1, "max_units": 8, "price_per_unit": 150000 },
    { "min_units": 9, "max_units": null, "price_per_unit": 100000 }
  ],
  "deposit": 1000000,
  "tax_percent": 11
}
```

#### Backend
- Buat `src/shared/utils/pricingEngine.js`:
  - `calculatePrice(startDatetime, endDatetime, pricingScheme)`
  - Return: `{ subtotal, tax, deposit, total, breakdown }`
- Endpoint `GET /api/v1/assets/:id/price-estimate?start=...&end=...`
- Gunakan `pricingEngine` di `BillingService.generateInvoice` (gantikan hardcoded `dailyRate`)

#### Frontend
- Tambahkan UI Pricing Builder di form tambah/edit Aset (Admin)
- Tambahkan komponen **PriceEstimate** di form BookAsset — kalkulasi otomatis saat tanggal diisi

---

### 3. Conflict Checking Saat Booking

**Priority: 🔴 P1 — Integritas data**

#### Backend
- Di `RentalService.createDraft` atau saat `submitRequest`, tambahkan query cek overlap:
```sql
SELECT COUNT(*) FROM rental_requests
WHERE asset_id = ?
  AND status NOT IN ('REJECTED', 'CANCELLED', 'DRAFT')
  AND start_datetime < ? AND end_datetime > ?
```
- Return `409 Conflict` jika ada tumpang tindih

---

## Backlog Sprint 10: File Storage & PDF (P2)

### 4. File Upload ke Cloudflare R2

**Priority: 🟠 P2**

- Install `@aws-sdk/client-s3` (R2 compatible S3 API)
- Buat `src/config/r2.js` dengan credentials dari env
- Buat `src/shared/utils/fileUpload.js` — wrapper upload ke R2
- Endpoint: `POST /api/v1/upload` — terima file, return URL

#### Frontend
- Ganti semua mock URL dengan upload nyata via `<input type="file">`
- Komponen `FileUploader.jsx` reusable

---

### 5. PDF Generation (Async)

**Priority: 🟠 P2**

- Install `puppeteer-core` + `@sparticuz/chromium` atau `pdfkit`
- Buat template HTML invoice dan kontrak
- Generate PDF di background (job) setelah record dibuat
- Update `pdf_url` setelah selesai
- UI sudah menampilkan "⏳ PDF sedang diproses" ✅

---

## Backlog Sprint 11: Dynamic Form & Type Asset (P2)

### 6. Asset-Level Form Schema

**Priority: 🟠 P2 — Pending konfirmasi stakeholder**

#### Schema DB
- Tambah kolom `form_schema_json` di tabel `assets` (bukan `asset_categories`)

```json
{
  "type": "VENUE",
  "extra_fields": [
    { "key": "event_type", "label": "Tipe Acara", "type": "select", "options": ["Seminar", "Workshop", "Pameran"], "required": true },
    { "key": "sound_system", "label": "Butuh Sound System?", "type": "boolean", "required": false }
  ],
  "required_docs": ["KTP", "SURAT_PENGANTAR"],
  "pricing_unit": "hour"
}
```

#### Frontend
- `BookAsset.jsx` diubah menjadi Dynamic Form Renderer
- Data extra disimpan sebagai `extra_data_json` di `rental_requests`

---

## Backlog Sprint 12: Polish & Automation (P3)

### 7. Auto-Complete Job

```js
// Cron: setiap jam
SELECT * FROM rental_requests WHERE status = 'ACTIVE_RENTAL' AND end_datetime < NOW()
// → UPDATE status = 'COMPLETED'
```

### 8. Notifikasi In-App
- Tambah model `Notification` di Prisma
- Insert notif di setiap status change
- FE: polling atau WebSocket

> [!NOTE]
> Sprint 9 wajib diselesaikan sebelum sistem bisa dipakai di environment production.
> Sprint 10 (R2) menunggu credentials dari user.
> Sprint 11 menunggu konfirmasi stakeholder soal skema form per-aset.
