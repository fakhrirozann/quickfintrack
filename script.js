// ============================
// QuickLog - script.js (final)
// ============================

// DOM
const steps = Array.from(document.querySelectorAll(".step"));
const inputAmount = document.getElementById("amount");
const inputItem = document.getElementById("item");
const inputCategory = document.getElementById("category");
const datalistCategory = document.getElementById("category-list");
const inputDatetime = document.getElementById("datetime");
const inputLocation = document.getElementById("location");
const getLocationBtn = document.getElementById("get-location");
const skipLocationBtn = document.getElementById("skip-location");
const saveBtn = document.getElementById("save-btn");
const toast = document.getElementById("toast");

const logList = document.getElementById("log-list");
const emptyLog = document.getElementById("empty-log");
const downloadCsvBtn = document.getElementById("download-csv");
const clearAllBtn = document.getElementById("clear-all");

const navQuick = document.getElementById("nav-quick");
const navLog = document.getElementById("nav-log");
const quickView = document.getElementById("quick-view");
const logView = document.getElementById("log-view");
const pageTitle = document.getElementById("page-title");

// state
let currentStep = 0;
let tempData = {
  amount: "",
  item: "",
  category: "",
  datetime: "",
  location: ""
};

// --- init ---
document.addEventListener("DOMContentLoaded", () => {
  setDefaultDatetime();
  loadCategories();
  loadLogs();
  showStep(0);
});


// --- Step UI helpers ---
function showStep(index) {
  steps.forEach((s, i) => {
    if (i === index) s.classList.add("active");
    else s.classList.remove("active");
  });
  currentStep = index;
  const active = steps[index];
  const input = active && active.querySelector("input");
  if (input) {
    // focus but give mobile a tiny delay so keyboard shows reliably
    setTimeout(() => {
      try { input.focus({ preventScroll: true }); } catch(e){ input.focus(); }
    }, 100);
    // set correct inputmode for amount
    if (active.dataset.step === "amount") input.setAttribute("inputmode","numeric");
    else input.removeAttribute("inputmode");
  }
}

// press Enter on inputs -> nextStep (except done)
document.querySelectorAll(".step input").forEach(inp => {
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If current step is last (done), ignore (user should press Save)
      if (currentStep < steps.length - 1) nextStep();
    }
  });
});

// move to next step with validation
function nextStep() {
  const stepEl = steps[currentStep];
  const id = stepEl.dataset.step;
  const input = stepEl.querySelector("input");

  // validation: required fields (amount, item, category)
  if (["amount","item","category"].includes(id)) {
    if (!input || input.value.trim() === "") {
      // simple shake or focus
      input.focus();
      return;
    }
  }

  // store value
  if (input) tempData[id] = input.value.trim();

  // advance
  if (currentStep < steps.length - 1) {
    showStep(currentStep + 1);
  }
  
}

// --- Default datetime ---
function setDefaultDatetime() {
  const now = new Date();
  // convert to local ISO for datetime-local input
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  inputDatetime.value = local;
  tempData.datetime = inputDatetime.value;
}

// --- Location buttons ---
getLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung geolocation.");
    return;
  }
  getLocationBtn.disabled = true;
  getLocationBtn.textContent = "Mencari...";
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(4);
    const lng = pos.coords.longitude.toFixed(4);
    inputLocation.value = `${lat}, ${lng}`;
    getLocationBtn.disabled = false;
    getLocationBtn.textContent = "Gunakan Lokasi";
  }, err => {
    alert("Gagal mendapat lokasi.");
    getLocationBtn.disabled = false;
    getLocationBtn.textContent = "Gunakan Lokasi";
  }, { timeout: 8000 });
});

skipLocationBtn.addEventListener("click", () => {
  inputLocation.value = "";
  nextStep();
});

// --- Save ---
saveBtn.addEventListener("click", saveTransaction);

function saveTransaction() {
  // collect fields (ensure latest)
  tempData.amount = inputAmount.value.trim();
  tempData.item = inputItem.value.trim();
  tempData.category = inputCategory.value.trim();
  tempData.datetime = inputDatetime.value.trim();
  tempData.location = inputLocation.value.trim();

  if (!tempData.amount || !tempData.item || !tempData.category) {
    alert("Mohon isi Nominal, Item, dan Kategori.");
    // go to the first empty required field
    if (!tempData.amount) showStep(0);
    else if (!tempData.item) showStep(1);
    else if (!tempData.category) showStep(2);
    return;
  }

  const logs = getLogs();
  const newLog = {
    id: Date.now(),
    amount: Number(tempData.amount),
    item: tempData.item,
    category: tempData.category,
    datetime: tempData.datetime || new Date().toISOString(),
    location: tempData.location || ""
  };
  logs.push(newLog);
  localStorage.setItem("logs", JSON.stringify(logs));

  // categories: add if new (case-insensitive)
  addCategory(newLog.category);

  // reset for next input
  clearInputs();
  showToast("✅ Disimpan");
  loadLogs();
  showStep(0);
}

function clearInputs() {
  inputAmount.value = "";
  inputItem.value = "";
  inputCategory.value = "";
  setDefaultDatetime();
  inputLocation.value = "";
  tempData = { amount:"", item:"", category:"", datetime:"", location:"" };
}

// --- Toast ---
let toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toast.style.display = "";
  }, 1600);
}

// --- LocalStorage helpers ---
function getLogs() {
  return JSON.parse(localStorage.getItem("logs") || "[]");
}

// load logs into UI
function loadLogs() {
  const logs = getLogs().sort((a,b) => b.id - a.id);
  logList.innerHTML = "";
  if (logs.length === 0) {
    emptyLog.style.display = "block";
    return;
  }
  emptyLog.style.display = "none";

  logs.forEach(l => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.dataset.id = l.id;

    item.innerHTML = `
      <div class="log-left">
        <div class="log-amt">Rp ${Number(l.amount).toLocaleString("id-ID")}</div>
        <div class="log-meta">${escapeHtml(l.item)} • ${escapeHtml(l.category)} • ${formatDate(l.datetime)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        ${l.location ? `<div class="log-meta" style="font-size:12px">${escapeHtml(l.location)}</div>` : ""}
        <button class="delete-btn" data-id="${l.id}">Hapus</button>
      </div>
    `;
    // add touch events for swipe-to-delete (simple)
    addSwipeToDelete(item, l.id);
    logList.appendChild(item);
  });

  // bind delete buttons
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm("Hapus transaksi ini?")) {
        deleteLog(id);
      }
    });
  });
}

function deleteLog(id) {
  let logs = getLogs();
  logs = logs.filter(x => String(x.id) !== String(id));
  localStorage.setItem("logs", JSON.stringify(logs));
  loadLogs();
}

// clear all
clearAllBtn.addEventListener("click", () => {
  if (confirm("Hapus semua catatan?")) {
    localStorage.removeItem("logs");
    loadLogs();
  }
});

// --- Categories ---
function loadCategories() {
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  datalistCategory.innerHTML = "";
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    datalistCategory.appendChild(opt);
  });
}

// add category (avoid duplicates, case-insensitive)
function addCategory(cat) {
  if (!cat) return;
  const cats = JSON.parse(localStorage.getItem("categories") || "[]");
  const exists = cats.some(c => c.toLowerCase() === cat.toLowerCase());
  if (!exists) {
    cats.push(cat);
    localStorage.setItem("categories", JSON.stringify(cats));
    loadCategories();
  }
}

// if user types new category and presses Enter on category field, we should add it
inputCategory.addEventListener("blur", () => {
  const v = inputCategory.value.trim();
  if (v) addCategory(v);
});

// --- CSV Export ---
downloadCsvBtn.addEventListener("click", () => {
  const logs = getLogs();
  if (!logs || logs.length === 0) {
    alert("Belum ada data untuk diunduh.");
    return;
  }
  const header = ["Tanggal & Waktu","Item","Kategori","Nominal","Lokasi"];
  const rows = logs.map(l => [
    formatDate(l.datetime),
    l.item.replace(/"/g,'""'),
    l.category.replace(/"/g,'""'),
    l.amount,
    (l.location || "").replace(/"/g,'""')
  ]);
  // build CSV
  const csv = [header.map(h => `"${h}"`).join(","),
               ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `quicklog-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
});

// --- Navigation (bottom nav) ---
navQuick.addEventListener("click", () => {
  quickView.classList.add("active");
  logView.classList.remove("active");
  navQuick.classList.add("active");
  navLog.classList.remove("active");
  pageTitle.textContent = "Quick Log";
});

navLog.addEventListener("click", () => {
  quickView.classList.remove("active");
  logView.classList.add("active");
  navQuick.classList.remove("active");
  navLog.classList.add("active");
  pageTitle.textContent = "Log";
});

// --- Utils ---
function formatDate(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return dt || "";
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m]; });
}

// --- Swipe to delete (simple mobile detection) ---
function addSwipeToDelete(el, id) {
  let startX = 0;
  let moved = false;

  el.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    moved = false;
  }, { passive: true });

  el.addEventListener("touchmove", (e) => {
    const x = e.touches[0].clientX;
    const dx = x - startX;
    if (dx < -20) {
      // move visually a bit
      el.style.transform = `translateX(${dx}px)`;
      moved = true;
    }
  }, { passive: true });

  el.addEventListener("touchend", (e) => {
    if (!moved) {
      el.style.transform = "";
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    el.style.transform = "";
    // if swipe left far enough, trigger delete confirm
    if (dx < -80) {
      if (confirm("Hapus transaksi ini?")) deleteLog(id);
    }
  });
}
