// ===== DATA STORE =====
// Semua data web (anggota, statistik, turnamen) disimpan di database
// Supabase (lihat js/supabase-config.js). Admin panel mengubah data ini
// lewat form, tersimpan ke server, lalu halaman publik siapapun yang
// membuka web ini akan melihat data yang sama.

const DEFAULT_DATA = {
  branding: {
    logoUrl: "img/logo-icon.png"
  },
  team: {
    winLoss: "18-4",
    winRate: "82%",
    trophies: 3,
    mvp: "Kaizen",
    founded: { trophies: 3, members: 5, tournaments: 4 }
  },
  members: [
    { id: 1, name: "Kaizen", role: "Gold Laner", initials: "GL", photo: "" },
    { id: 2, name: "Ryzen", role: "Jungler", initials: "JG", photo: "" },
    { id: 3, name: "Aegis", role: "Mid Laner", initials: "MD", photo: "" },
    { id: 4, name: "Draven", role: "Roamer", initials: "RM", photo: "" },
    { id: 5, name: "Vortex", role: "Exp Laner", initials: "EX", photo: "" }
  ],
  tournaments: {
    live: {
      name: "RGL Fast Tour #4",
      format: "Single Elimination",
      participants: 8,
      currentRound: "Semifinal",
      rounds: [
        {
          label: "Perempat Final",
          matches: [
            { teamA: "Phoenix Squad", scoreA: 2, teamB: "Nightfall", scoreB: 0 },
            { teamA: "RGL", scoreA: 2, teamB: "Ashen Guard", scoreB: 1 },
            { teamA: "Iron Wolves", scoreA: 2, teamB: "Ember Rise", scoreB: 0 },
            { teamA: "Crimson Order", scoreA: 2, teamB: "Void Reapers", scoreB: 1 }
          ]
        },
        {
          label: "Semifinal",
          matches: [
            { teamA: "Phoenix Squad", scoreA: 1, teamB: "RGL", scoreB: 1 },
            { teamA: "Iron Wolves", scoreA: 2, teamB: "Crimson Order", scoreB: 0 }
          ]
        },
        {
          label: "Final",
          matches: [
            { teamA: "Menunggu", scoreA: null, teamB: "Iron Wolves", scoreB: null }
          ]
        }
      ]
    },
    upcoming: {
      name: "RGL Fast Tour #5",
      format: "Single Elimination",
      participants: "16 Tim (kuota terbuka)",
      startDate: "20 Juli 2026"
    },
    done: {
      name: "RGL Fast Tour #3",
      champion: "RGL",
      runnerUp: "Phoenix Squad",
      participants: 8
    }
  }
};

const SITE_DATA_ROW_ID = 1;

// ===== HELPER: escape HTML =====
// Dipakai di render.js & admin.js sebelum menyisipkan string apapun yang
// berasal dari data (nama pemain, nama tim, dll) ke dalam innerHTML atau
// atribut HTML. Mencegah markup rusak atau XSS kalau ada karakter
// " < > & di data (misal nama pemain yang mengandung tanda kutip).
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

async function getData() {
  try {
    const { data, error } = await supabaseClient
      .from("site_data")
      .select("data")
      .eq("id", SITE_DATA_ROW_ID)
      .single();

    if (error || !data) {
      console.error("Gagal mengambil data dari Supabase, pakai data default:", error);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return data.data;
  } catch (e) {
    console.error("Error koneksi ke Supabase, pakai data default:", e);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

async function saveData(newData) {
  try {
    const { error } = await supabaseClient
      .from("site_data")
      .update({ data: newData })
      .eq("id", SITE_DATA_ROW_ID);

    if (error) {
      console.error("Gagal menyimpan data ke Supabase:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Error koneksi ke Supabase saat menyimpan:", e);
    return false;
  }
}
