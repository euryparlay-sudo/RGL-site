// ===== RENDER DATA KE HALAMAN PUBLIK =====
document.addEventListener("DOMContentLoaded", async () => {
  const data = await getData();

  renderHomeStats(data);
  renderSquad(data);
  renderTour(data);
  initTabs();
});

function renderHomeStats(data) {
  const box = document.getElementById("foundedStats");
  if (!box) return;
  const f = data.team.founded;
  box.innerHTML = `
    <div class="timer-unit"><div class="timer-num">${f.trophies}</div><div class="timer-cap">Trofi</div></div>
    <div class="timer-unit"><div class="timer-num">${f.members}</div><div class="timer-cap">Anggota</div></div>
    <div class="timer-unit"><div class="timer-num">${f.tournaments}</div><div class="timer-cap">Turnamen<br>Digelar</div></div>
  `;
}

function renderSquad(data) {
  const rosterGrid = document.getElementById("rosterGrid");
  if (rosterGrid) {
    rosterGrid.innerHTML = data.members
      .map(
        (m) => `
      <div class="player-card">
        <div class="avatar">${m.initials}</div>
        <div class="player-name">${m.name}</div>
        <div class="player-role">${m.role}</div>
      </div>`
      )
      .join("");
  }

  const statsGrid = document.getElementById("statsGrid");
  if (statsGrid) {
    const t = data.team;
    statsGrid.innerHTML = `
      <div class="stat-box"><div class="stat-num">${t.winLoss}</div><div class="stat-cap">Menang - Kalah</div></div>
      <div class="stat-box"><div class="stat-num">${t.winRate}</div><div class="stat-cap">Win Rate</div></div>
      <div class="stat-box"><div class="stat-num">${t.trophies}</div><div class="stat-cap">Trofi Juara</div></div>
      <div class="stat-box"><div class="stat-num">${t.mvp}</div><div class="stat-cap">MVP Terbanyak</div></div>
    `;
  }
}

function renderTour(data) {
  const bracketScroll = document.getElementById("bracketScroll");
  if (!bracketScroll) return;

  const live = data.tournaments.live;
  document.getElementById("liveName").textContent = live.name;
  document.getElementById("liveMeta").innerHTML = `
    Format: <span>${live.format}</span><br>
    Peserta: <span>${live.participants} Tim</span><br>
    Babak saat ini: <span>${live.currentRound}</span>
  `;
  bracketScroll.innerHTML = live.rounds
    .map(
      (round) => `
    <div class="round-col">
      <div class="round-label">${round.label}</div>
      ${round.matches.map(renderMatch).join("")}
    </div>`
    )
    .join("");

  const up = data.tournaments.upcoming;
  const upName = document.getElementById("upcomingName");
  if (upName) {
    upName.textContent = up.name;
    document.getElementById("upcomingMeta").innerHTML = `
      Format: <span>${up.format}</span><br>
      Peserta: <span>${up.participants}</span><br>
      Mulai: <span>${up.startDate}</span>
    `;
  }

  const done = data.tournaments.done;
  const doneName = document.getElementById("doneName");
  if (doneName) {
    doneName.textContent = done.name;
    document.getElementById("doneMeta").innerHTML = `
      Juara: <span>${done.champion}</span><br>
      Runner-up: <span>${done.runnerUp}</span><br>
      Total peserta: <span>${done.participants} Tim</span>
    `;
  }
}

function renderMatch(m) {
  const hasScore = m.scoreA !== null && m.scoreA !== undefined;
  if (!hasScore) {
    return `<div class="match-box">
      <div class="team-row tbd"><span>${m.teamA}</span><span class="score">—</span></div>
      <div class="team-row tbd"><span>${m.teamB}</span><span class="score">—</span></div>
    </div>`;
  }
  const aWin = m.scoreA > m.scoreB;
  const bWin = m.scoreB > m.scoreA;
  return `<div class="match-box">
    <div class="team-row ${aWin ? "winner" : bWin ? "loser" : ""}"><span>${m.teamA}</span><span class="score">${m.scoreA}</span></div>
    <div class="team-row ${bWin ? "winner" : aWin ? "loser" : ""}"><span>${m.teamB}</span><span class="score">${m.scoreB}</span></div>
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
