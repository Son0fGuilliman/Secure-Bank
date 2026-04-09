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

## Tanggal: 9 April 2026 — Ditemukan via Jenkins CI/CD Pipeline

### Vulnerability 1: Vite HIGH
- **Package:** vite 8.0.0 - 8.0.4
- **Severity:** HIGH
- **CVE:** GHSA-4w7w-66w2-5vf9, GHSA-v2wj-q39q-566r, GHSA-p9ff-h696-f583
- **Deskripsi:** Path Traversal di Optimized Deps, server.fs.deny bypass, Arbitrary File Read via WebSocket
- **Dampak:** Penyerang bisa baca file di luar root project via dev server
- **Hubungan Threat Model:** Threat #10 (Database/File diakses dari internet) - Information Disclosure
- **Fix:** `npm install vite@latest`
- **Status:** ✅ Fixed

### Vulnerability 2: Nodemailer MODERATE
- **Package:** nodemailer <= 8.0.4
- **Severity:** MODERATE
- **CVE:** GHSA-vvjj-xcjg-gr5g
- **Deskripsi:** SMTP Command Injection via CRLF di Transport name option (EHLO/HELO)
- **Dampak:** Penyerang bisa injeksi SMTP command saat pengiriman email OTP
- **Hubungan Threat Model:** Threat #2 (OTP Brute Force) - jika SMTP diinjeksi, OTP bisa dikirim ke tujuan salah
- **Fix:** `npm install nodemailer@latest`
- **Status:** ✅ Fixed

### Catatan Penting
Kedua vulnerability ini ditemukan secara otomatis oleh pipeline Jenkins CI/CD
pada Stage 3 (Dependency Audit / SCA). Ini membuktikan bahwa pipeline
DevSecOps berfungsi sebagai automated security gate.