// ===== KONFIGURASI SUPABASE =====
// Isi 2 nilai di bawah ini dengan punya kamu sendiri.
// Cara dapatnya: Supabase Dashboard > Project Settings > API
//   - Project URL       -> SUPABASE_URL
//   - anon public key   -> SUPABASE_ANON_KEY

const SUPABASE_URL = "https://pkwtcgggwdomybkrungs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4tiXuA0luVFD9j1RgWrdoA_V0uUArIx";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
