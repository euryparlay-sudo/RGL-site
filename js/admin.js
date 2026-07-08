// ===== ADMIN PANEL =====
// CATATAN: Login di bawah ini HANYA gerbang sederhana di sisi browser
// (bukan sistem keamanan sungguhan). Siapapun yang lihat kode sumber bisa
// menemukan passwordnya. Cukup untuk mencegah pengunjung biasa iseng ubah
// data, TAPI untuk keamanan asli nanti perlu Supabase Auth + RLS policy
// yang lebih ketat.
const ADMIN_PASSWORD = "rgl2026";

document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("loginForm");
  const loginScreen = document.getElementById("loginScreen");
  const panelScreen = document.getElementById("panelScreen");

  if (sessionStorage.getItem("rglAdminAuth") === "true") {
    await showPanel();
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
    await loadAdminData();
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

async function loadAdminData() {
  const data = await getData();
  renderMemberForm(data);
  renderStatsForm(data);
  renderTourForm(data);
}

// ---------- ANGGOTA ----------
function renderMemberForm(data) {
  const list = document.getElementById("memberList");
  list.innerHTML = data.members
    .map(
      (m, i) => `
    <div class="member-row" data-index="${i}">
      <input type="text" class="member-name" value="${m.name}" placeholder="Nama">
      <input type="text" class="member-role" value="${m.role}" placeholder="Role">
      <input type="text" class="member-initials" value="${m.initials}" placeholder="IN" style="max-width:50px;">
      <button class="icon-btn" onclick="deleteMember(${i})">✕</button>
    </div>`
    )
    .join("");
}

async function addMember() {
  const data = await getData();
  data.members.push({ id: Date.now(), name: "", role: "", initials: "" });
  await saveData(data);
  renderMemberForm(data);
}

async function deleteMember(index) {
  const data = await getData();
  data.members.splice(index, 1);
  await saveData(data);
  renderMemberForm(data);
}

async function saveMemberForm() {
  const data = await getData();
  const rows = document.querySelectorAll("#memberList .member-row");
  data.members = Array.from(rows).map((row, i) => ({
    id: data.members[i] ? data.members[i].id : Date.now() + i,
    name: row.querySelector(".member-name").value,
    role: row.querySelector(".member-role").value,
    initials: row.querySelector(".member-initials").value.toUpperCase()
  }));
  data.team.founded.members = data.members.length;
  await saveData(data);
  showToast("Data anggota tersimpan");
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

async function saveStatsForm() {
  const data = await getData();
  data.team.winLoss = document.getElementById("statWinLoss").value;
  data.team.winRate = document.getElementById("statWinRate").value;
  data.team.trophies = document.getElementById("statTrophies").value;
  data.team.mvp = document.getElementById("statMvp").value;
  data.team.founded.trophies = document.getElementById("foundedTrophies").value;
  data.team.founded.tournaments = document.getElementById("foundedTournaments").value;
  await saveData(data);
  showToast("Statistik tim tersimpan");
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
      <div class="admin-card-title">${round.label}</div>
      ${round.matches
        .map(
          (m, mi) => `
        <div class="match-edit" data-round="${ri}" data-match="${mi}">
          <div class="match-edit-row">
            <input type="text" class="edit-teamA" value="${m.teamA}" placeholder="Tim A">
            <input type="number" class="edit-scoreA score-input" value="${m.scoreA ?? ""}" placeholder="-">
          </div>
          <div class="match-edit-row">
            <input type="text" class="edit-teamB" value="${m.teamB}" placeholder="Tim B">
            <input type="number" class="edit-scoreB score-input" value="${m.scoreB ?? ""}" placeholder="-">
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

async function saveTourForm() {
  const data = await getData();
  const live = data.tournaments.live;

  live.name = document.getElementById("liveNameInput").value;
  live.format = document.getElementById("liveFormatInput").value;
  live.participants = document.getElementById("liveParticipantsInput").value;
  live.currentRound = document.getElementById("liveRoundInput").value;

  document.querySelectorAll(".match-edit").forEach((box) => {
    const ri = box.getAttribute("data-round");
    const mi = box.getAttribute("data-match");
    const scoreAVal = box.querySelector(".edit-scoreA").value;
    const scoreBVal = box.querySelector(".edit-scoreB").value;
    live.rounds[ri].matches[mi] = {
      teamA: box.querySelector(".edit-teamA").value,
      scoreA: scoreAVal === "" ? null : Number(scoreAVal),
      teamB: box.querySelector(".edit-teamB").value,
      scoreB: scoreBVal === "" ? null : Number(scoreBVal)
    };
  });

  data.tournaments.upcoming = {
    name: document.getElementById("upNameInput").value,
    format: document.getElementById("upFormatInput").value,
    participants: document.getElementById("upParticipantsInput").value,
    startDate: document.getElementById("upStartInput").value
  };

  data.tournaments.done = {
    name: document.getElementById("doneNameInput").value,
    champion: document.getElementById("doneChampionInput").value,
    runnerUp: document.getElementById("doneRunnerUpInput").value,
    participants: document.getElementById("doneParticipantsInput").value
  };

  await saveData(data);
  showToast("Data turnamen tersimpan");
}

// ---------- TOAST ----------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
