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

© 2025 QuickLog — Built with care and minimal dependencies.
