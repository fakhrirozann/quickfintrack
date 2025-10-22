/* script.js (v2.1)
   App namespace modular approach
*/
const App = {
  state: {
    currentStep: 0,
    steps: [],
  },
  data: {
    logs: [],
    categories: new Set(),
  },
};

/* ---------------------------
   CORE DATA + STORAGE
   --------------------------- */
App.Core = {
  load() {
    const saved = localStorage.getItem("logs");
    if (saved) App.data.logs = JSON.parse(saved);
    const savedCats = localStorage.getItem("categories");
    if (savedCats) App.data.categories = new Set(JSON.parse(savedCats));
  },

  persist() {
    localStorage.setItem("logs", JSON.stringify(App.data.logs));
    localStorage.setItem("categories", JSON.stringify([...App.data.categories]));
  },

  addLog(entry) {
    App.data.logs.push(entry);
    App.Core.persist();
    App.UI.renderLogs();
    App.UI.updateSummary();
    App.UI.updateCategoryList();
  },

  removeLog(index) {
    App.data.logs.splice(index, 1);
    App.Core.persist();
    App.UI.renderLogs();
    App.UI.updateSummary();
  },

  clearAll() {
    if (!confirm("Yakin ingin menghapus semua data?")) return;
    App.data.logs = [];
    App.Core.persist();
    App.UI.renderLogs();
    App.UI.updateSummary();
  },

  downloadCSV() {
    const rows = [["Nominal", "Item", "Kategori", "Tanggal", "Lokasi"]];
    App.data.logs.forEach((log) => {
      rows.push([log.amount, log.item, log.category, log.datetime, log.location || ""]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "QuickLog.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

/* ---------------------------
   UI MODULE
   --------------------------- */
App.UI = {
  init() {
    // Steps
    App.state.steps = Array.from(document.querySelectorAll(".step"));
    // Wire controls
    this.prevBtn = document.getElementById("prev-btn");
    this.nextBtn = document.getElementById("next-btn");
    this.saveBtn = document.getElementById("save-btn");
    this.backBtn = document.getElementById("back-btn");
    this.getLocBtn = document.getElementById("get-location");
    this.toast = document.getElementById("toast");
    this.overlay = document.getElementById("overlay-success");
    this.logList = document.getElementById("log-list");
    this.emptyLog = document.getElementById("empty-log");
    this.summaryText = document.getElementById("summary-text");
    this.ctaAddLog = document.getElementById("cta-add-log");

    // Inputs
    this.inputs = {
      amount: document.getElementById("amount"),
      item: document.getElementById("item"),
      category: document.getElementById("category"),
      datetime: document.getElementById("datetime"),
      location: document.getElementById("location"),
    };

    // Clear buttons (delegated via wrapper)
    document.querySelectorAll(".input-wrapper").forEach((wrap) => {
      const input = wrap.querySelector("input");
      const clearBtn = wrap.querySelector(".clear-btn");
      if (!clearBtn || !input) return;
      // initial visibility
      clearBtn.style.display = input.value && input.value.trim() !== "" ? "block" : "none";
      // input -> toggle clear btn
      input.addEventListener("input", () => {
        clearBtn.style.display = input.value && input.value.trim() !== "" ? "block" : "none";
        App.UI.updateNextButton();
      });
      // click clear
      clearBtn.addEventListener("click", () => {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      });
    });

    // Prev / Next
    this.prevBtn.addEventListener("click", () => App.UI.prevStep());
    this.nextBtn.addEventListener("click", () => App.UI.handleNextClick());

    // Save & Back inside done step
    this.saveBtn.addEventListener("click", () => App.UI.saveCurrent());
    this.backBtn.addEventListener("click", () => App.UI.prevStep());

    // Location button
    if (this.getLocBtn) this.getLocBtn.addEventListener("click", () => App.UI.getLocation());

    // Log actions (delete)
    this.logList.addEventListener("click", (e) => {
      const btn = e.target.closest(".delete-btn");
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      if (!Number.isNaN(idx)) App.Core.removeLog(idx);
    });

    // Clear all & download csv in settings
    const clearAllBtn = document.getElementById("clear-all");
    if (clearAllBtn) clearAllBtn.addEventListener("click", () => App.Core.clearAll());
    const downloadBtn = document.getElementById("download-csv");
    if (downloadBtn) downloadBtn.addEventListener("click", () => App.Core.downloadCSV());

    // Bottom nav
    document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", App.UI.switchView));

    // CTA in empty state
    if (this.ctaAddLog) this.ctaAddLog.addEventListener("click", () => {
      App.UI.switchToView("quick");
      setTimeout(() => this.inputs.amount.focus(), 120);
    });

    // Inputs: Enter key to go next (or save if last)
    Object.values(this.inputs).forEach((inp) => {
      if (!inp) return;
      inp.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          // update UI state then move
          App.UI.updateNextButton();
          // If on last step (done) and save is present, trigger save
          if (App.state.currentStep === App.state.steps.length - 1) {
            App.UI.saveCurrent();
          } else {
            App.UI.handleNextClick();
          }
        }
      });
    });

    // Theme controls handled by App.Theme (init later)
    App.Theme.init();

    // Initial render
    this.showStep(0);
    this.renderLogs();
    this.updateSummary();
    this.updateCategoryList();
    this.updateNextButton(); // ensure button state reflects first input
  },

  // Show specific step index
  showStep(index) {
    const len = App.state.steps.length;
    if (index < 0) index = 0;
    if (index > len - 1) index = len - 1;
    App.state.currentStep = index;

  // Auto-fill datetime field if empty
  if (App.state.steps[index].dataset.step === "datetime") {
    const dt = App.UI.inputs.datetime;
    if (dt && !dt.value) {
      const now = new Date();
      const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      dt.value = localISO;
    }
  }

    App.state.steps.forEach((s, i) => {
      s.classList.toggle("active", i === index);
    });

    // Prev visibility: hide in first step
    this.prevBtn.style.visibility = index === 0 ? "hidden" : "visible";

    // Wizard nav visibility: hide when last (done)
    const wizardNav = document.querySelector(".wizard-nav");
    if (index === len - 1) {
      wizardNav.style.display = "none";
    } else {
      wizardNav.style.display = "flex";
    }

    // Update next button state/text depending on step type
    this.updateNextButton();

    // update step indicator text
    const indicator = document.getElementById("step-indicator");
    if (indicator) indicator.textContent = `Step ${index + 1} dari ${len}`;
  
    // Auto focus first input in this step (if any)
    const firstInput = App.state.steps[index].querySelector("input");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 120);
    }
  },

  // Determine if a step is required (amount,item,category,datetime are required)
  stepIsRequired(stepEl) {
    const name = stepEl.dataset.step;
    return ["amount", "item", "category", "datetime"].includes(name);
  },

  // Update next button label and disabled state based on current step & input
  updateNextButton() {
    const idx = App.state.currentStep;
    const stepEl = App.state.steps[idx];
    if (!stepEl) return;
    const name = stepEl.dataset.step;
    const nextBtn = this.nextBtn;

    // find input (if any)
    const input = stepEl.querySelector("input");

    if (name === "location") {
      // optional
      const hasValue = input && input.value.trim() !== "";
      nextBtn.textContent = hasValue ? "Lanjutkan →" : "Lewati →";
      nextBtn.classList.toggle("inactive", false);
      nextBtn.disabled = false;
    } else {
      // required steps
      nextBtn.textContent = "Lanjutkan →";
      const filled = input && input.value.toString().trim() !== "";
      // For numeric inputs treat zero or NaN as empty
      if (input && input.type === "number") {
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
          nextBtn.classList.add("inactive");
          nextBtn.disabled = true;
          return;
        }
      }
      if (!filled) {
        nextBtn.classList.add("inactive");
        nextBtn.disabled = true;
      } else {
        nextBtn.classList.remove("inactive");
        nextBtn.disabled = false;
      }
    }
  },

  handleNextClick() {
    const idx = App.state.currentStep;
    const stepEl = App.state.steps[idx];
    if (!stepEl) return;

    const name = stepEl.dataset.step;
    const input = stepEl.querySelector("input");

    if (name === "location") {
      // optional: always allow next (Lewati or Lanjutkan)
      this.nextStep();
      return;
    }

    // required steps: check validation
    if (input) {
      if (input.type === "number") {
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
          // keep disabled — give light animation / focus
          input.classList.add("error");
          setTimeout(() => input.classList.remove("error"), 800);
          return;
        }
      }
      if (input.value.toString().trim() === "") {
        input.classList.add("error");
        setTimeout(() => input.classList.remove("error"), 800);
        return;
      }
    }
    // all good
    this.nextStep();
  },

  nextStep() {
    this.showStep(App.state.currentStep + 1);
  },

  prevStep() {
    if (App.state.currentStep === 0) return;
    this.showStep(App.state.currentStep - 1);
  },

  // Save current wizard values (validate final)
saveCurrent() {
  const amountVal = parseFloat(this.inputs.amount.value);
  const itemVal = this.inputs.item.value.trim();
  const categoryVal = this.inputs.category.value.trim();
  const datetimeVal = this.inputs.datetime.value || new Date().toISOString();
  const locationVal = this.inputs.location.value.trim();

  // --- Validation
  if (isNaN(amountVal) || amountVal <= 0) {
    this.showToast("⚠️ Masukkan nominal yang valid");
    this.inputs.amount.classList.add("error");
    setTimeout(() => this.inputs.amount.classList.remove("error"), 900);
    this.showStep(0);
    return;
  }
  if (!itemVal) {
    this.showToast("⚠️ Isi nama item");
    this.inputs.item.classList.add("error");
    setTimeout(() => this.inputs.item.classList.remove("error"), 900);
    this.showStep(1);
    return;
  }
  if (!categoryVal) {
    this.showToast("⚠️ Pilih atau ketik kategori");
    this.inputs.category.classList.add("error");
    setTimeout(() => this.inputs.category.classList.remove("error"), 900);
    this.showStep(2);
    return;
  }
  if (!datetimeVal) {
    this.showToast("⚠️ Pilih tanggal & waktu");
    this.inputs.datetime.classList.add("error");
    setTimeout(() => this.inputs.datetime.classList.remove("error"), 900);
    this.showStep(3);
    return;
  }

  const entry = {
    amount: amountVal,
    item: itemVal,
    category: categoryVal,
    datetime: datetimeVal,
    location: locationVal || "",
  };

  // --- Persist
  App.data.categories.add(categoryVal);
  App.Core.addLog(entry);

  // --- Visual feedback
  this.showOverlaySuccess();

  // --- Reset input fields
  Object.values(this.inputs).forEach((inp) => {
    if (!inp) return;
    inp.value = "";
    const wrap = inp.closest(".input-wrapper");
    if (wrap) {
      const cb = wrap.querySelector(".clear-btn");
      if (cb) cb.style.display = "none";
    }
  });

  // --- Force reset wizard back to step 0
  setTimeout(() => {
    // hard reset state
    App.state.currentStep = 0;
    App.state.steps.forEach((s, i) => s.classList.toggle("active", i === 0));

    // show wizard navigation again
    const wizardNav = document.querySelector(".wizard-nav");
    if (wizardNav) wizardNav.style.display = "flex";

    // hide “done” step completely
    const doneStep = document.querySelector('[data-step="done"]');
    if (doneStep) doneStep.classList.remove("active");

    // ensure previous button hidden again
    this.prevBtn.style.visibility = "hidden";

    // update button state + focus
    this.updateNextButton();
    setTimeout(() => this.inputs.amount.focus(), 250);
  }, 500);
},



  // show toast (text) short
  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.style.display = "block";
    this.toast.style.opacity = "1";
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.style.opacity = "0";
      setTimeout(() => (this.toast.style.display = "none"), 300);
    }, 1400);
  },

  showOverlaySuccess() {
    if (!this.overlay) return;
    this.overlay.style.display = "flex";
    this.overlay.style.opacity = "1";
    // simple fade out after 900ms
    clearTimeout(this._overlayTimer);
    this._overlayTimer = setTimeout(() => {
      this.overlay.style.transition = "opacity 0.95s";
      this.overlay.style.opacity = "0";
      setTimeout(() => (this.overlay.style.display = "none"), 550);
    }, 1200);
    // also show toast text
    this.showToast("✅ Transaksi tersimpan!");
  },

  // Render logs
  renderLogs() {
    this.logList.innerHTML = "";
    if (App.data.logs.length === 0) {
      this.emptyLog.style.display = "block";
      return;
    }
    this.emptyLog.style.display = "none";

    App.data.logs.forEach((log, i) => {
      const el = document.createElement("div");
      el.className = "log-item";
      const dateText = new Date(log.datetime).toLocaleString();
      el.innerHTML = `
        <div class="log-left">
          <div class="log-amt">Rp${Number(log.amount).toLocaleString("id-ID")}</div>
          <div class="log-meta">${log.item} — ${log.category}<br>${dateText}</div>
        </div>
        <button class="delete-btn" data-index="${i}">×</button>
      `;
      this.logList.appendChild(el);
    });
  },

  updateSummary() {
    // sum today's total (local timezone)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const totalToday = App.data.logs.reduce((acc, l) => {
      const d = new Date(l.datetime);
      if (d >= startOfDay && d < new Date(startOfDay.getTime() + 24 * 3600 * 1000)) {
        return acc + Number(l.amount || 0);
      }
      return acc;
    }, 0);
    this.summaryText.textContent = `💰 Total pengeluaran hari ini: Rp ${totalToday.toLocaleString("id-ID")}`;
  },

  updateCategoryList() {
    const list = document.getElementById("category-list");
    if (!list) return;
    list.innerHTML = [...App.data.categories].map(c => `<option value="${c}"></option>`).join("");
  },

  getLocation() {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung lokasi otomatis.");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      if (this.inputs.location) {
        this.inputs.location.value = coords;
        // show clear btn
        const wrap = this.inputs.location.closest(".input-wrapper");
        if (wrap) {
          const cb = wrap.querySelector(".clear-btn");
          if (cb) cb.style.display = "block";
        }
        this.updateNextButton();
      }
    }, () => alert("Tidak dapat mengambil lokasi."));
  },

  // switch view by nav target string or element event
  switchView(e) {
    let target;
    if (typeof e === "string") target = e;
    else target = e.currentTarget.dataset.viewTarget;
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    const btn = Array.from(document.querySelectorAll(".nav-btn")).find(b => b.dataset.viewTarget === target);
    if (btn) btn.classList.add("active");
    const viewEl = document.getElementById(`${target}-view`);
    if (viewEl) viewEl.classList.add("active");
    // focus amount when switching to quick
    if (target === "quick") setTimeout(() => this.inputs.amount && this.inputs.amount.focus(), 200);
  },

  switchToView(target) { this.switchView(target); }
};

/* ---------------------------
   THEME MODULE
   --------------------------- */
App.Theme = {
  init() {
    const root = document.documentElement;
    this.autoSwitch = document.getElementById("theme-auto");
    this.autoType = document.getElementById("theme-auto-type");
    this.manualSwitch = document.getElementById("theme-manual");
    this.manualHint = document.getElementById("theme-manual-hint");

    // load saved
    const savedAuto = localStorage.getItem("theme-auto");
    const savedMode = localStorage.getItem("theme-mode");

    if (savedAuto === "false") this.autoSwitch.checked = false;
    if (savedMode) root.dataset.theme = savedMode;

    // utility
    const detectAuto = () => {
      if (!this.autoType) return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
      if (this.autoType.value === "device") {
        return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
      } else {
        const h = new Date().getHours();
        return (h >= 18 || h < 6) ? "dark" : "light";
      }
    };

    const apply = (mode) => {
      root.dataset.theme = mode;
      localStorage.setItem("theme-mode", mode);
    };

    const update = () => {
      if (this.autoSwitch.checked) {
        this.manualSwitch.disabled = true;
        if (this.manualSwitch.closest) {
          // apply visual disabled styling
          const wrap = this.manualSwitch.closest(".setting-item");
          if (wrap) wrap.style.opacity = "0.6";
        }
        localStorage.setItem("theme-auto", "true");
        apply(detectAuto());
        if (this.manualHint) this.manualHint.textContent = "Nonaktif saat mode otomatis aktif.";
      } else {
        this.manualSwitch.disabled = false;
        const wrap = this.manualSwitch.closest(".setting-item");
        if (wrap) wrap.style.opacity = "1";
        localStorage.setItem("theme-auto", "false");
        apply(this.manualSwitch.checked ? "dark" : "light");
        if (this.manualHint) this.manualHint.textContent = "Aktif: pilih tema manual.";
      }
    };

    // event listeners
    if (this.autoSwitch) this.autoSwitch.addEventListener("change", update);
    if (this.autoType) this.autoType.addEventListener("change", update);
    if (this.manualSwitch) this.manualSwitch.addEventListener("change", update);

    // initial update
    update();

    // also watch system changes if using device mode
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener && mq.addEventListener("change", () => {
        if (this.autoSwitch.checked && this.autoType.value === "device") update();
      });
    }
  }
};

// ==========================
// Keyboard Shortcut Support
// ==========================
document.addEventListener("keydown", (e) => {
  // Abaikan kalau sedang di input yang multi-line
  if (e.target.tagName === "TEXTAREA") return;

  // ENTER atau SPASI berfungsi sebagai "Lanjutkan" atau "Simpan"
  if (e.key === "Enter" || e.key === " " || e.code === "Space") {
    const activeEl = document.activeElement;
    // Abaikan kalau lagi ngetik di input
    if (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") return;

    e.preventDefault();

    const nextBtn = document.getElementById("next-btn");
    const saveBtn = document.getElementById("save-btn");

    // Kalau step masih input → klik next
    if (nextBtn && nextBtn.offsetParent !== null && !nextBtn.disabled) {
      nextBtn.click();
    }
    // Kalau sudah di step terakhir → klik simpan
    else if (saveBtn && saveBtn.offsetParent !== null && !saveBtn.disabled) {
      saveBtn.click();
    }
  }
});

/* ---------------------------
   BOOT
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  App.Core.load();
  App.UI.init();
});
