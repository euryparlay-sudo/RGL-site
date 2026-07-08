// ===== RENDER DATA KE HALAMAN PUBLIK =====
document.addEventListener("DOMContentLoaded", async () => {
  initTabs();

  const data = await getData();
  renderBranding(data);
  renderHomeStats(data);
  renderSquad(data);
  renderTour(data);
});

function renderBranding(data) {
  const logoUrl = data.branding && data.branding.logoUrl;
  if (!logoUrl) return;
  document.querySelectorAll(".brand-mark").forEach((el) => {
    el.innerHTML = `<img src="${escapeHtml(logoUrl)}" alt="Logo RGL">`;
  });
  const heroLogo = document.getElementById("heroLogo");
  if (heroLogo) heroLogo.src = logoUrl;
}

function renderHomeStats(data) {
  const box = document.getElementById("foundedStats");
  if (!box) return;
  const f = data.team.founded;
  box.innerHTML = `
    <div class="timer-unit"><div class="timer-num">${escapeHtml(f.trophies)}</div><div class="timer-cap">Trofi</div></div>
    <div class="timer-unit"><div class="timer-num">${escapeHtml(f.members)}</div><div class="timer-cap">Anggota</div></div>
    <div class="timer-unit"><div class="timer-num">${escapeHtml(f.tournaments)}</div><div class="timer-cap">Turnamen<br>Digelar</div></div>
  `;
}

function renderSquad(data) {
  const rosterGrid = document.getElementById("rosterGrid");
  if (rosterGrid) {
    rosterGrid.innerHTML = data.members
      .map(
        (m) => `
      <div class="player-card">
        <div class="avatar">${m.photo ? `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}">` : escapeHtml(m.initials)}</div>
        <div class="player-name">${escapeHtml(m.name)}</div>
        <div class="player-role">${escapeHtml(m.role)}</div>
      </div>`
      )
      .join("");
  }

  const statsGrid = document.getElementById("statsGrid");
  if (statsGrid) {
    const t = data.team;
    statsGrid.innerHTML = `
      <div class="stat-box"><div class="stat-num">${escapeHtml(t.winLoss)}</div><div class="stat-cap">Menang - Kalah</div></div>
      <div class="stat-box"><div class="stat-num">${escapeHtml(t.winRate)}</div><div class="stat-cap">Win Rate</div></div>
      <div class="stat-box"><div class="stat-num">${escapeHtml(t.trophies)}</div><div class="stat-cap">Trofi Juara</div></div>
      <div class="stat-box"><div class="stat-num">${escapeHtml(t.mvp)}</div><div class="stat-cap">MVP Terbanyak</div></div>
    `;
  }
}

function renderTour(data) {
  const bracketScroll = document.getElementById("bracketScroll");
  if (!bracketScroll) return;

  const live = data.tournaments.live;
  const liveNameEl = document.getElementById("liveName");
  if (liveNameEl) liveNameEl.textContent = live.name;
  const liveMetaEl = document.getElementById("liveMeta");
  if (liveMetaEl) {
    liveMetaEl.innerHTML = `
      Format: <span>${escapeHtml(live.format)}</span><br>
      Peserta: <span>${escapeHtml(live.participants)} Tim</span><br>
      Babak saat ini: <span>${escapeHtml(live.currentRound)}</span>
    `;
  }
  bracketScroll.innerHTML = live.rounds
    .map(
      (round) => `
    <div class="round-col">
      <div class="round-label">${escapeHtml(round.label)}</div>
      ${round.matches.map(renderMatch).join("")}
    </div>`
    )
    .join("");

  const up = data.tournaments.upcoming;
  const upName = document.getElementById("upcomingName");
  if (upName) {
    upName.textContent = up.name;
    document.getElementById("upcomingMeta").innerHTML = `
      Format: <span>${escapeHtml(up.format)}</span><br>
      Peserta: <span>${escapeHtml(up.participants)}</span><br>
      Mulai: <span>${escapeHtml(up.startDate)}</span>
    `;
  }

  const done = data.tournaments.done;
  const doneName = document.getElementById("doneName");
  if (doneName) {
    doneName.textContent = done.name;
    document.getElementById("doneMeta").innerHTML = `
      Juara: <span>${escapeHtml(done.champion)}</span><br>
      Runner-up: <span>${escapeHtml(done.runnerUp)}</span><br>
      Total peserta: <span>${escapeHtml(done.participants)} Tim</span>
    `;
  }
}

function renderMatch(m) {
  // Kedua skor harus terisi (bukan null/undefined) baru dianggap "sudah main".
  // Sebelumnya cuma scoreA yang dicek, jadi kalau salah satu skor kosong,
  // sisi lain tampil sebagai literal teks "null" di layar.
  const hasScore =
    m.scoreA !== null && m.scoreA !== undefined &&
    m.scoreB !== null && m.scoreB !== undefined;

  if (!hasScore) {
    return `<div class="match-box">
      <div class="team-row tbd"><span>${escapeHtml(m.teamA)}</span><span class="score">—</span></div>
      <div class="team-row tbd"><span>${escapeHtml(m.teamB)}</span><span class="score">—</span></div>
    </div>`;
  }
  const aWin = m.scoreA > m.scoreB;
  const bWin = m.scoreB > m.scoreA;
  return `<div class="match-box">
    <div class="team-row ${aWin ? "winner" : bWin ? "loser" : ""}"><span>${escapeHtml(m.teamA)}</span><span class="score">${m.scoreA}</span></div>
    <div class="team-row ${bWin ? "winner" : aWin ? "loser" : ""}"><span>${escapeHtml(m.teamB)}</span><span class="score">${m.scoreB}</span></div>
  </div>`;
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");
      panels.forEach((panel) => {
        panel.style.display = panel.getAttribute("data-panel") === target ? "block" : "none";
      });
    });
  });
}
