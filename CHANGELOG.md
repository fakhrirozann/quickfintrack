# 🧭 QuickLog — Changelog

A simple, clean web app for tracking daily transactions.  
Designed with focus on clarity, smooth UX, and modular structure.

---

## v2.1.2 — 2025-10-22
### ✨ Improvements
- Input fields now auto-focus when each step opens.
- Date & time fields auto-fill with local time (no need manual input).
- “Lanjutkan” button now activates automatically for required steps.
- Navigation and view switching confirmed stable.
- Small polish on button states and transition smoothness.

### ⚙️ Notes
This version is now the **stable public release** — ready for GitHub Pages.  
All features from v2.1.0+ remain backward compatible with previous data.

---

## v2.1.1 — 2025-10-22
### 🐞 Fix
- Fixed navigation issue where all views appeared together.
- Added missing `.view` display rule in CSS for proper tab switching.

---

## v2.1.0 — 2025-10-21
### 🧱 Major Update
- Introduced 3-tab layout: **Catat**, **Riwayat**, **Opsi**.
- Rebuilt input process into step-based **wizard**:
  1. Nominal  
  2. Item  
  3. Kategori  
  4. Tanggal & Waktu  
  5. Lokasi  
  6. Simpan
- “Lewati / Lanjutkan” logic now dynamic based on field state.
- Added quick clear (×) button in each input field.
- Added success overlay: `✅ Transaksi tersimpan!`
- “Riwayat” now shows summary and CTA when empty.
- Added **theme settings**: Auto (device/time) & Manual with state hints.
- Cleaned HTML structure and made JS modular for scalability.

---

## v2.0.x — 2025-09
Legacy build before modular refactor.  
Core transaction features worked, but UI static and unoptimized.

---

## 🧩 Data & Storage
- Stored locally via `localStorage` keys:
  - `logs`
  - `categories`
  - `theme-mode`
  - `theme-auto`
- All updates are backward compatible — no data reset needed.

---

## 🚀 Next (Planned for v2.2)
- [ ] Auto-save draft transactions  
- [ ] Smooth animated tab transitions  
- [ ] Monthly & daily summary filters  
- [ ] Extended log export options (CSV/JSON)  

---

# 📦 Changelog  
Setiap perubahan penting dalam proyek ini akan didokumentasikan di sini.  
Format mengikuti [Keep a Changelog](https://keepachangelog.com/), dan versi mengikuti [Semantic Versioning](https://semver.org/).

---

🧾 Changelog – v2.2 (2025-10-22)
Release Name: “Theme & Wizard Overhaul”

✨ Added
Multi-tab navigation (Catat, Riwayat, Opsi) dengan state aktif.
“Opsi” tab berisi kontrol baru:
Download CSV dan Hapus Semua (dipindahkan dari tab log).
Dark/Light Mode Switch dengan tiga mode:
Otomatis (ikut perangkat atau waktu lokal).
Manual dengan status aktif/nonaktif.
Tema langsung sinkron dengan preferensi user dan animasi transisi halus.
Quick delete (×) button di setiap input field.
Auto-focus input pada setiap langkah wizard.
Auto-fill datetime berdasarkan waktu lokal saat ini.
Auto layout responsiveness (viewport width dan safe area).
Persistent step indicator dengan teks “Step x dari y”.

🔧 Changed / Improved
Input Wizard UX overhaul
Tombol “Kembali” disembunyikan di step pertama.
Tombol dinamis “Lanjutkan” / “Lewati” disesuaikan dengan konteks input (wajib atau opsional).
Step terakhir kini hanya menampilkan tombol “Simpan” dan “Kembali”.
Validation UX
Nominal input otomatis mendeteksi karakter non-digit dan menampilkan pesan kesalahan langsung di bawah field.
Field wajib hanya bisa lanjut jika valid.
Toast feedback dan overlay success digabung: pengguna dapat memilih salah satu, dan durasi dapat disesuaikan.
Setelah “Simpan”, wizard otomatis kembali ke step awal dan reset form.
Dark/light theme system dimodularisasi dengan data-theme dan CSS variables.
Bottom navigation sekarang full width, mengikuti tema aktif, dan tidak ikut scroll konten.
Header bar diperluas selebar viewport (seperti bottom bar), dengan transisi dan opsi sticky untuk UX yang lebih konsisten.
Padding konten disesuaikan agar tidak tertutup bottom nav.

🩹 Fixed
Bug di mana seluruh view tampil sekaligus (tab navigation tidak berfungsi).
Issue di mana form tidak reset setelah penyimpanan.
Layout header tidak sejajar dengan lebar viewport.
Bottom navigation tidak mengikuti tema dark/light.
Minor focus issue pada input field pertama di setiap step.
Responsivitas layout pada layar kecil.

📁 Structure / Code Maintenance
JavaScript direstrukturisasi menjadi lebih modular (App.UI, App.state, App.actions).
Komponen form, nav, dan setting dibuat terpisah logikanya agar mudah patching di versi berikut.
Semua style kini menggunakan CSS variables untuk mendukung tema adaptif.
Pembersihan kode dan komentar untuk maintainability jangka panjang.


© 2025 QuickLog — Built with care and minimal dependencies.
