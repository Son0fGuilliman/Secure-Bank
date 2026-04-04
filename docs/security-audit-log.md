# Security Audit Log — SecureBank

## Tanggal: 2 April 2026

### Vulnerability Ditemukan
- **Package:** nodemailer <= 8.0.3
- **Severity:** HIGH
- **CVE:** GHSA-mm7p-fcc7-pg87, GHSA-rcmh-qjqh-p98v, GHSA-c7w3-x93f-qmm8
- **Deskripsi:**
  - Email dapat dikirim ke domain yang tidak diinginkan (Interpretation Conflict)
  - DoS via recursive calls di addressparser
  - SMTP command injection via unsanitized `envelope.size` parameter

### Hubungan ke Threat Model
- Terkait dengan **Threat #6 (Nasabah Menyangkal Transfer)** — jika notifikasi email
  bisa dimanipulasi, bukti audit trail via email menjadi tidak reliable
- Terkait dengan **Threat #16 (Penyadapan Password)** — SMTP injection bisa
  digunakan untuk redirect email OTP ke penyerang

### Tindakan Perbaikan
- Update nodemailer dari versi ^6.9.9 ke versi latest (8.0.4+)
- Perintah: `npm install nodemailer@latest`

### Status
- [x] Teridentifikasi via `npm audit`
- [x] Diperbaiki via `npm install nodemailer@latest`
- [x] Diverifikasi: `npm audit` menunjukkan 0 vulnerabilities