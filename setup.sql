-- Jalankan seluruh isi file ini di Supabase Dashboard > SQL Editor > New Query > Run

create table site_data (
  id int primary key,
  data jsonb not null
);

insert into site_data (id, data) values (1, '{
  "team": {
    "winLoss": "18-4",
    "winRate": "82%",
    "trophies": 3,
    "mvp": "Kaizen",
    "founded": { "trophies": 3, "members": 5, "tournaments": 4 }
  },
  "members": [
    { "id": 1, "name": "Kaizen", "role": "Gold Laner", "initials": "GL" },
    { "id": 2, "name": "Ryzen", "role": "Jungler", "initials": "JG" },
    { "id": 3, "name": "Aegis", "role": "Mid Laner", "initials": "MD" },
    { "id": 4, "name": "Draven", "role": "Roamer", "initials": "RM" },
    { "id": 5, "name": "Vortex", "role": "Exp Laner", "initials": "EX" }
  ],
  "tournaments": {
    "live": {
      "name": "RGL Fast Tour #4",
      "format": "Single Elimination",
      "participants": 8,
      "currentRound": "Semifinal",
      "rounds": [
        {
          "label": "Perempat Final",
          "matches": [
            { "teamA": "Phoenix Squad", "scoreA": 2, "teamB": "Nightfall", "scoreB": 0 },
            { "teamA": "RGL", "scoreA": 2, "teamB": "Ashen Guard", "scoreB": 1 },
            { "teamA": "Iron Wolves", "scoreA": 2, "teamB": "Ember Rise", "scoreB": 0 },
            { "teamA": "Crimson Order", "scoreA": 2, "teamB": "Void Reapers", "scoreB": 1 }
          ]
        },
        {
          "label": "Semifinal",
          "matches": [
            { "teamA": "Phoenix Squad", "scoreA": 1, "teamB": "RGL", "scoreB": 1 },
            { "teamA": "Iron Wolves", "scoreA": 2, "teamB": "Crimson Order", "scoreB": 0 }
          ]
        },
        {
          "label": "Final",
          "matches": [
            { "teamA": "Menunggu", "scoreA": null, "teamB": "Iron Wolves", "scoreB": null }
          ]
        }
      ]
    },
    "upcoming": {
      "name": "RGL Fast Tour #5",
      "format": "Single Elimination",
      "participants": "16 Tim (kuota terbuka)",
      "startDate": "20 Juli 2026"
    },
    "done": {
      "name": "RGL Fast Tour #3",
      "champion": "RGL",
      "runnerUp": "Phoenix Squad",
      "participants": 8
    }
  }
}');

-- Izinkan siapapun (pengunjung web) membaca data
alter table site_data enable row level security;

create policy "Public read access"
on site_data for select
using (true);

-- Izinkan update data (dipakai admin panel).
-- Catatan: kebijakan ini masih terbuka di level API -- proteksi utama tetap
-- password di admin.html. Untuk keamanan lebih ketat nanti bisa diganti
-- pakai Supabase Auth.
create policy "Public write access"
on site_data for update
using (true);
