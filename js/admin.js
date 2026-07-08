// ===== ADMIN PANEL =====
// CATATAN: Login di bawah ini HANYA gerbang sederhana di sisi browser
// (bukan sistem keamanan sungguhan). Siapapun yang lihat kode sumber bisa
// menemukan passwordnya. Cukup untuk mencegah pengunjung biasa iseng ubah
// data, TAPI untuk keamanan asli nanti perlu Supabase Auth + RLS policy
// yang lebih ketat.
const ADMIN_PASSWORD = "rgl2026";

// Cache data yang sedang diedit di panel ini. Dipakai bersama oleh semua
// fungsi render/simpan supaya tidak fetch ulang ke Supabase tiap kali
// (sebelumnya getData() dipanggil 2x saat load: sekali untuk logo, sekali
// lagi untuk isi form panel).
let adminData = null;
let adminDataPromise = null;

document.addEventListener("DOMContentLoaded", () => {
  // Fetch sekali di awal untuk logo di nav (nav tampil baik di layar
  // login maupun layar panel). Promise-nya disimpan supaya showPanel()
  // bisa memakai ulang hasil fetch yang sama, bukan fetch baru.
  adminDataPromise = getData()
    .then((d) => {
      applyBranding(d);
      return d;
    })
    .catch((e) => {
      console.error("Gagal memuat data awal:", e);
      return null;
    });

  const loginForm = document.getElementById("loginForm");
  const loginScreen = document.getElementById("loginScreen");
  const panelScreen = document.getElementById("panelScreen");

  if (sessionStorage.getItem("rglAdminAuth") === "true") {
    showPanel();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("passwordInput").value;
      if (input === ADMIN_PASSWORD) {
        sessionStorage.setItem("rglAdminAuth", "true");
        await showPanel();
      } else {
        document.getElementById("loginError").textContent = "Password salah. Coba lagi.";
      }
    });
  }

  async function showPanel() {
    loginScreen.style.display = "none";
    panelScreen.style.display = "block";
    try {
      // Pakai hasil fetch awal kalau sudah selesai/berhasil; kalau belum
      // ada atau gagal, baru fetch ulang sebagai fallback.
      adminData = (await adminDataPromise) || (await getData());
      renderMemberForm(adminData.members);
      renderStatsForm(adminData);
      renderTourForm(adminData);
    } catch (e) {
      console.error("Gagal memuat data admin:", e);
      showToast("Gagal memuat data. Cek konfigurasi Supabase.");
    }
  }

  const adminTabs = document.querySelectorAll(".admin-tab");
  const adminPanels = document.querySelectorAll(".admin-panel");
  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      adminTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-admin-tab");
      adminPanels.forEach((p) => {
        p.classList.toggle("active", p.getAttribute("data-admin-panel") === target);
      });
    });
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("rglAdminAuth");
      window.location.reload();
    });
  }
});

function applyBranding(data) {
  const logoUrl = data && data.branding && data.branding.logoUrl;
  if (!logoUrl) return;
  document.querySelectorAll(".brand-mark").forEach((el) => {
    el.innerHTML = `<img src="${escapeHtml(logoUrl)}" alt="Logo RGL">`;
  });
}

// ---------- ANGGOTA ----------
let lastKnownMembers = [];

function renderMemberForm(members) {
  lastKnownMembers = members;
  const list = document.getElementById("memberList");
  list.innerHTML = members
    .map(
      (m, i) => `
    <div class="member-row-wrap" data-index="${i}">
      <div class="member-row">
        <input type="text" class="member-name" value="${escapeHtml(m.name)}" placeholder="Nama">
        <input type="text" class="member-role" value="${escapeHtml(m.role)}" placeholder="Role">
        <input type="text" class="member-initials" value="${escapeHtml(m.initials)}" placeholder="IN" style="max-width:50px;">
        <button class="icon-btn" onclick="deleteMember(${i})">✕</button>
      </div>
      <input type="text" class="member-photo" value="${escapeHtml(m.photo || "")}" placeholder="URL foto (opsional, kosongkan untuk pakai inisial)">
    </div>`
    )
    .join("");
}

function collectMembersFromForm() {
  const rows = document.querySelectorAll("#memberList .member-row-wrap");
  return Array.from(rows).map((row, i) => ({
    id: lastKnownMembers[i] ? lastKnownMembers[i].id : Date.now() + i,
    name: row.querySelector(".member-name").value,
    role: row.querySelector(".member-role").value,
    initials: row.querySelector(".member-initials").value.toUpperCase(),
    photo: row.querySelector(".member-photo").value.trim()
  }));
}

function addMember() {
  const current = collectMembersFromForm();
  current.push({ id: Date.now(), name: "", role: "", initials: "", photo: "" });
  renderMemberForm(current);
}

function deleteMember(index) {
  const current = collectMembersFromForm();
  current.splice(index, 1);
  renderMemberForm(current);
}

async function saveMemberForm() {
  if (!adminData) return;
  adminData.members = collectMembersFromForm();
  adminData.team.founded.members = adminData.members.length;
  const ok = await saveData(adminData);
  if (ok) {
    lastKnownMembers = adminData.members;
    showToast("Data anggota tersimpan");
  } else {
    showToast("Gagal simpan — cek koneksi/Supabase");
  }
}

// ---------- STATISTIK TIM ----------
function renderStatsForm(data) {
  document.getElementById("statWinLoss").value = data.team.winLoss;
  document.getElementById("statWinRate").value = data.team.winRate;
  document.getElementById("statTrophies").value = data.team.trophies;
  document.getElementById("statMvp").value = data.team.mvp;
  document.getElementById("foundedTrophies").value = data.team.founded.trophies;
  document.getElementById("foundedTournaments").value = data.team.founded.tournaments;
}

// Field angka (trophies, tournaments, participants) awalnya bertipe Number
// di skema data, tapi input HTML selalu mengembalikan string. Tanpa
// dikonversi balik, tipe datanya jadi campur String/Number di JSONB.
// Kalau hasil parse bukan angka valid, dikembalikan 0 daripada NaN.
function toIntOrZero(value) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

async function saveStatsForm() {
  if (!adminData) return;
  adminData.team.winLoss = document.getElementById("statWinLoss").value;
  adminData.team.winRate = document.getElementById("statWinRate").value;
  adminData.team.trophies = toIntOrZero(document.getElementById("statTrophies").value);
  adminData.team.mvp = document.getElementById("statMvp").value;
  adminData.team.founded.trophies = toIntOrZero(document.getElementById("foundedTrophies").value);
  adminData.team.founded.tournaments = toIntOrZero(document.getElementById("foundedTournaments").value);
  const ok = await saveData(adminData);
  showToast(ok ? "Statistik tim tersimpan" : "Gagal simpan — cek koneksi/Supabase");
}

// ---------- TURNAMEN ----------
function renderTourForm(data) {
  const live = data.tournaments.live;
  document.getElementById("liveNameInput").value = live.name;
  document.getElementById("liveFormatInput").value = live.format;
  document.getElementById("liveParticipantsInput").value = live.participants;
  document.getElementById("liveRoundInput").value = live.currentRound;

  const roundsBox = document.getElementById("roundsEditor");
  roundsBox.innerHTML = live.rounds
    .map(
      (round, ri) => `
    <div class="admin-card">
      <div class="admin-card-title">${escapeHtml(round.label)}</div>
      ${round.matches
        .map(
          (m, mi) => `
        <div class="match-edit" data-round="${ri}" data-match="${mi}">
          <div class="match-edit-row">
            <input type="text" class="edit-teamA" value="${escapeHtml(m.teamA)}" placeholder="Tim A">
            <input type="number" min="0" step="1" class="edit-scoreA score-input" value="${m.scoreA ?? ""}" placeholder="-">
          </div>
          <div class="match-edit-row">
            <input type="text" class="edit-teamB" value="${escapeHtml(m.teamB)}" placeholder="Tim B">
            <input type="number" min="0" step="1" class="edit-scoreB score-input" value="${m.scoreB ?? ""}" placeholder="-">
          </div>
        </div>`
        )
        .join("")}
    </div>`
    )
    .join("");

  const up = data.tournaments.upcoming;
  document.getElementById("upNameInput").value = up.name;
  document.getElementById("upFormatInput").value = up.format;
  document.getElementById("upParticipantsInput").value = up.participants;
  document.getElementById("upStartInput").value = up.startDate;

  const done = data.tournaments.done;
  document.getElementById("doneNameInput").value = done.name;
  document.getElementById("doneChampionInput").value = done.champion;
  document.getElementById("doneRunnerUpInput").value = done.runnerUp;
  document.getElementById("doneParticipantsInput").value = done.participants;
}

// Parse skor pertandingan: kosong -> null (belum main). Cuma menerima
// digit bulat non-negatif (menolak "1.5", "3e2", "-1", dsb) supaya tidak
// ada skor aneh tersimpan hanya karena browser/keyboard mengizinkan
// karakter di luar digit pada input type="number".
function parseScore(value) {
  if (value === "" || value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return parseInt(trimmed, 10);
}

async function saveTourForm() {
  if (!adminData) return;
  const live = adminData.tournaments.live;

  live.name = document.getElementById("liveNameInput").value;
  live.format = document.getElementById("liveFormatInput").value;
  live.participants = toIntOrZero(document.getElementById("liveParticipantsInput").value);
  live.currentRound = document.getElementById("liveRoundInput").value;

  document.querySelectorAll(".match-edit").forEach((box) => {
    const ri = box.getAttribute("data-round");
    const mi = box.getAttribute("data-match");
    if (!live.rounds[ri] || !live.rounds[ri].matches[mi]) return; // jaga-jaga kalau struktur berubah

    let scoreA = parseScore(box.querySelector(".edit-scoreA").value);
    let scoreB = parseScore(box.querySelector(".edit-scoreB").value);
    // Kedua skor harus terisi bersamaan. Kalau cuma salah satu yang diisi,
    // anggap belum main (null-null) -- ini yang sebelumnya menyebabkan
    // teks "null" muncul di halaman publik saat skor cuma diisi sebagian.
    if (scoreA === null || scoreB === null) {
      scoreA = null;
      scoreB = null;
    }

    live.rounds[ri].matches[mi] = {
      teamA: box.querySelector(".edit-teamA").value,
      scoreA,
      teamB: box.querySelector(".edit-teamB").value,
      scoreB
    };
  });

  adminData.tournaments.upcoming = {
    name: document.getElementById("upNameInput").value,
    format: document.getElementById("upFormatInput").value,
    // Sengaja tetap teks bebas (mis. "16 Tim (kuota terbuka)"), bukan angka.
    participants: document.getElementById("upParticipantsInput").value,
    startDate: document.getElementById("upStartInput").value
  };

  adminData.tournaments.done = {
    name: document.getElementById("doneNameInput").value,
    champion: document.getElementById("doneChampionInput").value,
    runnerUp: document.getElementById("doneRunnerUpInput").value,
    participants: toIntOrZero(document.getElementById("doneParticipantsInput").value)
  };

  const ok = await saveData(adminData);
  showToast(ok ? "Data turnamen tersimpan" : "Gagal simpan — cek koneksi/Supabase");
}

// ---------- TOAST ----------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
