-- ============================================================
-- Ciycle — Seed Data (Sahte Veriler)
-- Supabase SQL Editor'de çalıştır
-- ============================================================

DO $$
DECLARE
  u1 uuid := '11111111-0000-0000-0000-000000000001';
  u2 uuid := '11111111-0000-0000-0000-000000000002';
  u3 uuid := '11111111-0000-0000-0000-000000000003';
  u4 uuid := '11111111-0000-0000-0000-000000000004';
  u5 uuid := '11111111-0000-0000-0000-000000000005';
  u6 uuid := '11111111-0000-0000-0000-000000000006';
  u7 uuid := '11111111-0000-0000-0000-000000000007';
  u8 uuid := '11111111-0000-0000-0000-000000000008';
BEGIN

-- ── 1. Auth Users ─────────────────────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  ('00000000-0000-0000-0000-000000000000', u1, 'authenticated', 'authenticated',
   'ahmet@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"ahmet_rider","full_name":"Ahmet Yılmaz","vehicle_type":"motorcycle"}',
   now() - interval '90 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u2, 'authenticated', 'authenticated',
   'selin@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"selin_wheels","full_name":"Selin Kaya","vehicle_type":"bicycle"}',
   now() - interval '75 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u3, 'authenticated', 'authenticated',
   'mert@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"mert_moto","full_name":"Mert Demir","vehicle_type":"motorcycle"}',
   now() - interval '60 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u4, 'authenticated', 'authenticated',
   'zeynep@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"zeynep_biker","full_name":"Zeynep Arslan","vehicle_type":"both"}',
   now() - interval '45 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u5, 'authenticated', 'authenticated',
   'burak@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"burak_touring","full_name":"Burak Şahin","vehicle_type":"motorcycle"}',
   now() - interval '30 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u6, 'authenticated', 'authenticated',
   'elif@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"elif_cyclist","full_name":"Elif Çelik","vehicle_type":"bicycle"}',
   now() - interval '20 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u7, 'authenticated', 'authenticated',
   'can@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"can_adventure","full_name":"Can Öztürk","vehicle_type":"both"}',
   now() - interval '15 days', now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', u8, 'authenticated', 'authenticated',
   'ayse@ciycle.app', crypt('Ciycle2025!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"ayse_road","full_name":"Ayşe Bozkurt","vehicle_type":"motorcycle"}',
   now() - interval '10 days', now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Profilleri zenginleştir ────────────────────────────
UPDATE public.profiles SET
  bio = 'Yol benim evim. Yamaha MT-09 ile Anadolu''yu keşfediyorum.',
  location = 'İstanbul, TR',
  website = 'https://ahmetrider.com',
  xp = 4200, level = 8, is_verified = true,
  followers_count = 342, following_count = 89, posts_count = 47,
  routes_count = 12, total_distance_km = 8750
WHERE id = u1;

UPDATE public.profiles SET
  bio = 'Bisikletle şehir kaşifi. Fixie + gravel. Kahve molası olmadan yol olmaz.',
  location = 'Ankara, TR',
  xp = 2800, level = 6,
  followers_count = 218, following_count = 134, posts_count = 31,
  routes_count = 8, total_distance_km = 3200
WHERE id = u2;

UPDATE public.profiles SET
  bio = 'BMW GS serisi tutkunu. Offroad ve uzun tur. İstanbul → Doğu Ekspresi.',
  location = 'İzmir, TR',
  xp = 6100, level = 11, is_verified = true,
  followers_count = 567, following_count = 203, posts_count = 78,
  routes_count = 24, total_distance_km = 22400
WHERE id = u3;

UPDATE public.profiles SET
  bio = 'Her iki tekerlek de benim için eşit! Moto ve bisiklet arası gidip geliyorum.',
  location = 'Bursa, TR',
  xp = 1900, level = 4,
  followers_count = 95, following_count = 67, posts_count = 18,
  routes_count = 5, total_distance_km = 1450
WHERE id = u4;

UPDATE public.profiles SET
  bio = 'Touring rider. Honda Africa Twin ile Türkiye''yi çepeçevre dolaştım. Sıradaki: Balkanlar.',
  location = 'Antalya, TR',
  xp = 8900, level = 15, is_verified = true,
  followers_count = 1203, following_count = 412, posts_count = 134,
  routes_count = 41, total_distance_km = 56000
WHERE id = u5;

UPDATE public.profiles SET
  bio = 'Şehir bisikletçisi. Sürdürülebilir ulaşım savunucusu.',
  location = 'İstanbul, TR',
  xp = 950, level = 2,
  followers_count = 43, following_count = 28, posts_count = 9,
  routes_count = 2, total_distance_km = 680
WHERE id = u6;

UPDATE public.profiles SET
  bio = 'Adventure is out there! Dual-sport & gravel. Doğa + iki teker = mutluluk.',
  location = 'Eskişehir, TR',
  xp = 3400, level = 7,
  followers_count = 178, following_count = 95, posts_count = 29,
  routes_count = 9, total_distance_km = 5200
WHERE id = u7;

UPDATE public.profiles SET
  bio = 'Ducati Monster 821. Hız değil, özgürlük. Hafta sonu turları için buradayım.',
  location = 'İstanbul, TR',
  xp = 1200, level = 3,
  followers_count = 67, following_count = 45, posts_count = 14,
  routes_count = 3, total_distance_km = 2100
WHERE id = u8;

-- ── 3. Takipleşmeler ─────────────────────────────────────
INSERT INTO public.follows (follower_id, following_id) VALUES
  (u1, u3), (u1, u5), (u1, u7), (u1, u2),
  (u2, u1), (u2, u6), (u2, u4),
  (u3, u1), (u3, u5), (u3, u7),
  (u4, u1), (u4, u3), (u4, u2),
  (u5, u1), (u5, u3), (u5, u7),
  (u6, u2), (u6, u4),
  (u7, u3), (u7, u5), (u7, u1),
  (u8, u1), (u8, u5), (u8, u3)
ON CONFLICT DO NOTHING;

-- ── 4. Kulüpler ───────────────────────────────────────────
-- clubs kolonları: id, founder_id, name, slug, description, avatar_url,
--   cover_url, location, vehicle_type, visibility, member_count, post_count, route_count
INSERT INTO public.clubs (id, founder_id, name, slug, description, vehicle_type, visibility, location, member_count, post_count)
VALUES
  ('cccccccc-0000-0000-0000-000000000001', u3,
   'Anadolu Touring Club', 'anadolu-touring',
   'Türkiye''nin dört bir yanını keşfeden touring motosikletçilerin buluşma noktası. Uzun tur, kamp ve macera!',
   'motorcycle', 'public', 'İstanbul', 87, 234),

  ('cccccccc-0000-0000-0000-000000000002', u2,
   'İstanbul Bisiklet Kooperatifi', 'istanbul-bisiklet',
   'İstanbul''da bisikletle ulaşımı yaygınlaştırmak ve keyifli sürüşler düzenlemek için bir aradayız.',
   'bicycle', 'public', 'İstanbul', 156, 89),

  ('cccccccc-0000-0000-0000-000000000003', u5,
   'Offroad Türkiye', 'offroad-turkiye',
   'Asfalt bitti, macera başlıyor! Dual-sport ve adventure motosikletçiler için offroad rotaları.',
   'motorcycle', 'public', 'Ankara', 43, 67)
ON CONFLICT DO NOTHING;

-- Kulüp üyelikleri
INSERT INTO public.club_members (club_id, user_id, role)
VALUES
  ('cccccccc-0000-0000-0000-000000000001', u3, 'founder'),
  ('cccccccc-0000-0000-0000-000000000001', u5, 'admin'),
  ('cccccccc-0000-0000-0000-000000000001', u1, 'member'),
  ('cccccccc-0000-0000-0000-000000000001', u7, 'member'),
  ('cccccccc-0000-0000-0000-000000000001', u8, 'member'),
  ('cccccccc-0000-0000-0000-000000000002', u2, 'founder'),
  ('cccccccc-0000-0000-0000-000000000002', u6, 'member'),
  ('cccccccc-0000-0000-0000-000000000002', u4, 'member'),
  ('cccccccc-0000-0000-0000-000000000003', u5, 'founder'),
  ('cccccccc-0000-0000-0000-000000000003', u3, 'admin'),
  ('cccccccc-0000-0000-0000-000000000003', u7, 'member')
ON CONFLICT DO NOTHING;

-- ── 5. Etkinlikler ────────────────────────────────────────
-- events kolonları: id, organizer_id, club_id, title, description,
--   start_at, end_at, location_name, location(jsonb),
--   max_participants, participants_count, visibility
INSERT INTO public.events (id, organizer_id, club_id, title, description,
  start_at, end_at, location_name, location, max_participants, participants_count, visibility)
VALUES
  ('eeeeeeee-0000-0000-0000-000000000001', u3, 'cccccccc-0000-0000-0000-000000000001',
   'Kapadokya Yaz Turu 2025',
   'Nevşehir, Göreme ve peri bacaları arasında 3 günlük efsane tur. Konaklama dahil, tüm seviyelere açık!',
   '2026-05-22 08:00:00+00', '2026-05-25 20:00:00+00',
   'Göreme Meydan, Nevşehir',
   '{"lat":38.6431,"lng":34.8289}',
   25, 18, 'public'),

  ('eeeeeeee-0000-0000-0000-000000000002', u2, 'cccccccc-0000-0000-0000-000000000002',
   'Boğaz Bisiklet Turu',
   'Köprüden köprüye İstanbul Boğazı bisiklet turu. 35 km, tüm seviyelere uygun.',
   '2026-05-11 09:00:00+00', '2026-05-11 14:00:00+00',
   'Galata Köprüsü, İstanbul',
   '{"lat":41.0169,"lng":28.9737}',
   40, 27, 'public'),

  ('eeeeeeee-0000-0000-0000-000000000003', u5, 'cccccccc-0000-0000-0000-000000000003',
   'Bolu Dağı Offroad Maratonu',
   'Bolu dağlarında zorlu offroad parkuru. Dual-sport ve adventure motorlar için.',
   '2026-05-29 07:00:00+00', '2026-05-29 17:00:00+00',
   'Bolu Dağı Geçidi',
   '{"lat":40.7456,"lng":31.5839}',
   20, 14, 'public'),

  ('eeeeeeee-0000-0000-0000-000000000004', u1, null,
   'İstanbul Gün Batımı Turu',
   'Prens Adaları''na gün batımı turumuz. Vapur ile Büyükada''ya geçiş.',
   '2026-05-15 16:00:00+00', '2026-05-15 21:00:00+00',
   'Kabataş İskelesi, İstanbul',
   '{"lat":41.0349,"lng":28.9989}',
   15, 8, 'public'),

  ('eeeeeeee-0000-0000-0000-000000000005', u7, null,
   'Motosiklet Bakım Atölyesi',
   'Temel motosiklet bakımını kendin yap! Yağ değişimi, zincir ayarı, lastik kontrolü.',
   '2026-05-18 10:00:00+00', '2026-05-18 14:00:00+00',
   'Kadıköy Oto Sanayi, İstanbul',
   '{"lat":40.9876,"lng":29.0543}',
   12, 9, 'public')
ON CONFLICT DO NOTHING;

-- ── 6. Rotalar ────────────────────────────────────────────
-- routes kolonları: id, author_id, title, description, road_type, difficulty,
--   visibility, stats, waypoints, tags, likes_count, saves_count, rides_count, comments_count
INSERT INTO public.routes (id, author_id, title, description, road_type, difficulty, visibility,
  stats, waypoints, start_location, end_location, bbox, tags, likes_count, saves_count, rides_count, comments_count)
VALUES
  ('a0000000-0000-0000-0000-000000000001', u3,
   'İstanbul → Sapanca Gölü',
   'TEM''den çıkıp köy yollarıyla Sapanca Gölü çevresini turlamak harika. Özellikle sonbahar renkleriyle muhteşem.',
   'mixed', 'moderate', 'public',
   '{"distance_km":180,"duration_min":210,"elevation_gain_m":650,"elevation_loss_m":620}',
   '[{"lat":41.015,"lng":28.979},{"lat":40.693,"lng":30.254}]',
   '{"name":"İstanbul","lat":41.015,"lng":28.979}',
   '{"name":"Sapanca Gölü","lat":40.693,"lng":30.254}',
   ARRAY[28.979, 40.693, 30.254, 41.015],
   ARRAY['hafta sonu','göl','sonbahar','orta seviye'],
   124, 67, 38, 14),

  ('a0000000-0000-0000-0000-000000000002', u5,
   'Ege Kıyı Yolu — Çeşme → Bodrum',
   '3 günlük efsane Ege turu. Sahil yolları, Yunan adaları manzarası, taze deniz ürünleri.',
   'asphalt', 'easy', 'public',
   '{"distance_km":430,"duration_min":360,"elevation_gain_m":1200,"elevation_loss_m":1180}',
   '[{"lat":38.325,"lng":26.304},{"lat":37.034,"lng":27.430}]',
   '{"name":"Çeşme","lat":38.325,"lng":26.304}',
   '{"name":"Bodrum","lat":37.034,"lng":27.430}',
   ARRAY[26.304, 37.034, 27.430, 38.325],
   ARRAY['ege','kıyı','uzun tur','3 gün','deniz'],
   287, 156, 72, 31),

  ('a0000000-0000-0000-0000-000000000003', u7,
   'Ankara — Kızılcahamam Offroad',
   'Başkentin hemen kuzeyinde saklı offroad cennet. Çam ormanları, köy yolları ve saf hava.',
   'offroad', 'hard', 'public',
   '{"distance_km":95,"duration_min":180,"elevation_gain_m":890,"elevation_loss_m":870}',
   '[{"lat":39.925,"lng":32.866},{"lat":40.474,"lng":32.645}]',
   '{"name":"Ankara","lat":39.925,"lng":32.866}',
   '{"name":"Kızılcahamam","lat":40.474,"lng":32.645}',
   ARRAY[32.645, 39.925, 32.866, 40.474],
   ARRAY['offroad','orman','zorlu','ankara','dual-sport'],
   89, 43, 21, 8),

  ('a0000000-0000-0000-0000-000000000004', u2,
   'Ankara Bisiklet Parkuru — Dikmen Vadisi',
   'Başkentte bisiklet cenneti. Dikmen Vadisi''nden başlayıp Eymir Gölü''ne uzanan 28 km''lik parkur.',
   'asphalt', 'easy', 'public',
   '{"distance_km":28,"duration_min":90,"elevation_gain_m":180,"elevation_loss_m":175}',
   '[{"lat":39.878,"lng":32.831},{"lat":39.800,"lng":32.770}]',
   '{"name":"Dikmen Vadisi","lat":39.878,"lng":32.831}',
   '{"name":"Eymir Gölü","lat":39.800,"lng":32.770}',
   ARRAY[32.770, 39.800, 32.831, 39.878],
   ARRAY['bisiklet','şehir','vadi','göl','ankara'],
   56, 29, 44, 7),

  ('a0000000-0000-0000-0000-000000000005', u1,
   'Boğaz Sahil Yolu — Sarıyer → Üsküdar',
   'İstanbul Boğazı''nın iki yakasını bağlayan romantik sahil turu. Köprü geçişi, yalı seyri.',
   'asphalt', 'easy', 'public',
   '{"distance_km":65,"duration_min":90,"elevation_gain_m":220,"elevation_loss_m":215}',
   '[{"lat":41.167,"lng":29.057},{"lat":41.023,"lng":29.028}]',
   '{"name":"Sarıyer","lat":41.167,"lng":29.057}',
   '{"name":"Üsküdar","lat":41.023,"lng":29.028}',
   ARRAY[29.028, 41.023, 29.057, 41.167],
   ARRAY['boğaz','istanbul','sahil','kolay','akşam turu'],
   198, 112, 85, 22)
ON CONFLICT DO NOTHING;

-- ── 7. Gönderiler ─────────────────────────────────────────
INSERT INTO public.posts (id, author_id, content, post_type, tags, media_urls,
  likes_count, comments_count, saves_count, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', u3,
   'Dün Sapanca turunu bitirdim. 180 km, 4 saat, sıfır sorun. BMW GS bu yollar için adeta yapılmış. Artık Türkiye''yi rotaya dökmeye devam ediyorum. Sırada Karadeniz kenarı!',
   'text', ARRAY['bmw','touring','sapanca','motosiklet'], ARRAY[]::text[],
   47, 12, 8, now() - interval '2 days'),

  ('b0000000-0000-0000-0000-000000000002', u5,
   'Ege turu bitti. 430 km, 3 gün, 1000 anı. Bodrum''a Afrika Twin ile varmak ayrı bir his. Yol arkadaşlarıma teşekkürler. Rota profilimde paylaştım, herkese açık!',
   'text', ARRAY['ege','africa twin','honda','tur','bodrum'], ARRAY[]::text[],
   134, 28, 41, now() - interval '5 days'),

  ('b0000000-0000-0000-0000-000000000003', u2,
   'Ankara Dikmen Vadisi''nde sabah sporu. 28 km, 1.5 saat. Şehrin tam ortasında bu kadar güzel bir bisiklet parkuru olduğunu bilmiyordum. Kesinlikle tavsiye ederim.',
   'text', ARRAY['bisiklet','ankara','sabah','spor','dikmen'], ARRAY[]::text[],
   31, 7, 5, now() - interval '1 day'),

  ('b0000000-0000-0000-0000-000000000004', u1,
   'Boğaz''da gün batımı turu harika geçti! İstanbul bu saatte bambaşka güzel. Yakında organize tur düzenleyeceğim, ilgilenenler yorum atsın.',
   'text', ARRAY['istanbul','boğaz','günbatımı','tur'], ARRAY[]::text[],
   89, 23, 17, now() - interval '3 days'),

  ('b0000000-0000-0000-0000-000000000005', u7,
   'Kızılcahamam offroad rotası gerçekten zormuş. 2 kez düştüm ama ikisi de yumuşak. Orman yollarında dual-sport sürmenin verdiği his inanılmaz. Detaylar rota profilimde.',
   'text', ARRAY['offroad','kızılcahamam','adventure','dual-sport'], ARRAY[]::text[],
   63, 18, 9, now() - interval '4 days'),

  ('b0000000-0000-0000-0000-000000000006', u4,
   'Bu hafta sonu hem bisiklet hem moto sürdüm. Cumartesi Bursa vadi bisikleti, Pazar sabahı motosikletle İnegöl turu. İkisi de süper. Hangisi daha iyi diye sormayın, ikisi de!',
   'text', ARRAY['bursa','bisiklet','motosiklet','haftasonu'], ARRAY[]::text[],
   28, 9, 4, now() - interval '2 days'),

  ('b0000000-0000-0000-0000-000000000007', u8,
   'Ducati Monster 821 aldım! Yıllardır hayal ettiğim motoru nihayet kapattım. İlk turumu İstanbul sahilinde yaptım. Hayatımın kararı mı bilinmez ama şu an çok mutluyum!',
   'text', ARRAY['ducati','monster','yeni motor','istanbul'], ARRAY[]::text[],
   156, 42, 23, now() - interval '8 days'),

  ('b0000000-0000-0000-0000-000000000008', u5,
   'Kapadokya turuna kayıt sayısı dolmak üzere! Hâlâ 7 yer var. Etkinlikler sekmesinden başvurabilirsiniz. 14 gün kaldı, kaçırmayın.',
   'text', ARRAY['kapadokya','tur','etkinlik','kayıt'], ARRAY[]::text[],
   72, 16, 31, now() - interval '1 day'),

  ('b0000000-0000-0000-0000-000000000009', u6,
   'İlk kez 50 km bisiklet sürdüm! Başlangıç için zor geldi ama bitti. Küçük adımlar büyük zaferleri getirir. Sıradaki hedef: 100 km.',
   'text', ARRAY['bisiklet','hedef','ilkdefa','motivasyon'], ARRAY[]::text[],
   44, 19, 6, now() - interval '6 days'),

  ('b0000000-0000-0000-0000-000000000010', u3,
   'Anadolu Touring Club olarak bu yıl 12 tur organize ettik. Üyelerimize teşekkürler! Yeni yıl takvimi yakında.',
   'text', ARRAY['kulüp','anadolutouring','touring','yılsonu'], ARRAY[]::text[],
   98, 24, 45, now() - interval '7 days'),

  ('b0000000-0000-0000-0000-000000000011', u1,
   'Motosiklet bakım ipucu: Zincirinizi her 500 km''de bir kontrol edin. Uzadıysa ayarlayın, kuruysa yağlayın. Bakımlı zincir = uzun ömür = güvenli sürüş.',
   'text', ARRAY['bakım','ipucu','zincir','güvenlik'], ARRAY[]::text[],
   211, 38, 87, now() - interval '10 days'),

  ('b0000000-0000-0000-0000-000000000012', u2,
   'Bisiklet kaskı takmadan sürüş yapmayın lütfen. Başınız çok değerli. Dün bir kaza gördüm, kasklı olan çok daha iyi çıktı. Güvenlik önce!',
   'text', ARRAY['güvenlik','kask','bisiklet','uyarı'], ARRAY[]::text[],
   167, 31, 52, now() - interval '9 days')
ON CONFLICT DO NOTHING;

-- ── 8. Beğeniler ──────────────────────────────────────────
INSERT INTO public.post_likes (post_id, user_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', u1),
  ('b0000000-0000-0000-0000-000000000001', u5),
  ('b0000000-0000-0000-0000-000000000001', u7),
  ('b0000000-0000-0000-0000-000000000002', u1),
  ('b0000000-0000-0000-0000-000000000002', u3),
  ('b0000000-0000-0000-0000-000000000002', u4),
  ('b0000000-0000-0000-0000-000000000003', u1),
  ('b0000000-0000-0000-0000-000000000003', u6),
  ('b0000000-0000-0000-0000-000000000007', u1),
  ('b0000000-0000-0000-0000-000000000007', u3),
  ('b0000000-0000-0000-0000-000000000007', u5),
  ('b0000000-0000-0000-0000-000000000011', u2),
  ('b0000000-0000-0000-0000-000000000011', u4),
  ('b0000000-0000-0000-0000-000000000011', u6),
  ('b0000000-0000-0000-0000-000000000012', u1),
  ('b0000000-0000-0000-0000-000000000012', u3),
  ('b0000000-0000-0000-0000-000000000012', u7)
ON CONFLICT DO NOTHING;

-- ── 9. Kaydetmeler ────────────────────────────────────────
INSERT INTO public.post_saves (post_id, user_id) VALUES
  ('b0000000-0000-0000-0000-000000000002', u1),
  ('b0000000-0000-0000-0000-000000000002', u7),
  ('b0000000-0000-0000-0000-000000000005', u3),
  ('b0000000-0000-0000-0000-000000000011', u2),
  ('b0000000-0000-0000-0000-000000000011', u4),
  ('b0000000-0000-0000-0000-000000000011', u8),
  ('b0000000-0000-0000-0000-000000000012', u5)
ON CONFLICT DO NOTHING;

-- ── 10. Yorumlar ─────────────────────────────────────────
INSERT INTO public.comments (post_id, author_id, content)
VALUES
  ('b0000000-0000-0000-0000-000000000001', u1, 'Harika görünüyor! Sapanca''yı ben de çok seviyorum, özellikle sabah erken gidince yol bomboş oluyor.'),
  ('b0000000-0000-0000-0000-000000000001', u5, 'GS bu tür yollarda gerçekten mükemmel. Karadeniz''de de harika olur!'),
  ('b0000000-0000-0000-0000-000000000002', u3, 'Tebrikler! Ben de geçen yıl bu rotayı yaptım, Marmaris kısmı şahaneydi.'),
  ('b0000000-0000-0000-0000-000000000007', u1, 'Hayırlı olsun! Monster gerçekten karakterli bir motor. İlk 1000 km''de yavaş yavaş ısın.'),
  ('b0000000-0000-0000-0000-000000000007', u5, 'Ducati ailesi büyüyor! Hayırlı olsun.'),
  ('b0000000-0000-0000-0000-000000000011', u6, 'Çok faydalı bilgi, teşekkürler! Bisiklet için de geçerli mi?'),
  ('b0000000-0000-0000-0000-000000000011', u1, 'Evet, bisiklet zincirleri için de aynı prensip geçerli. Balmumu bazlı yağ kullan.'),
  ('b0000000-0000-0000-0000-000000000012', u3, 'Kesinlikle katılıyorum. Kask tartışması olmaz, zorunlu.')
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ Seed data başarıyla yüklendi!';
RAISE NOTICE '👤 8 kullanıcı | 📝 12 gönderi | 🏍️ 5 rota | 📅 5 etkinlik | 🏛️ 3 kulüp';
RAISE NOTICE '📧 Test girişi: ahmet@ciycle.app / Ciycle2025!';

END $$;
