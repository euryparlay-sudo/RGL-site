-- Jalankan ini di Supabase SQL Editor (data lama kamu TIDAK akan hilang,
-- ini cuma menambahkan field baru: logo & foto anggota)
-- File ini aman dijalankan berulang kali: field yang sudah ada (mis. foto
-- yang sudah diisi lewat admin panel) TIDAK akan ditimpa balik jadi kosong.

update site_data
set data = jsonb_set(data, '{branding}', '{"logoUrl": "img/logo-icon.png"}', true)
where id = 1
  and not (data ? 'branding'); -- cuma isi kalau branding belum ada sama sekali

update site_data
set data = jsonb_set(
  data,
  '{members}',
  (
    select coalesce(jsonb_agg(
      case when member ? 'photo' then member else member || '{"photo": ""}'::jsonb end
    ), '[]'::jsonb)
    from jsonb_array_elements(coalesce(data->'members', '[]'::jsonb)) as member
  )
)
where id = 1;
