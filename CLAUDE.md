@AGENTS.md

# Ciycle — Proje Kılavuzu

> Motosiklet & bisiklet sosyal ağı. Enterprise Next.js 16 + Supabase + TypeScript strict.

---

## Git Branch Stratejisi

```
main                  ← production-ready, her zaman çalışır build
claude/<feature>      ← Claude'un geliştirme branch'leri
```

**KURAL:** Her değişiklik hem feature branch'e hem `main`'e push edilir.

```bash
# Feature geliştir → test → merge
git checkout main
git merge --no-ff claude/<feature>
git push -u origin main
```

**Main branch her zaman `npm run build` geçmeli.**

---

## Teknoloji Stack

| Katman | Teknoloji | Versiyon |
|---|---|---|
| Framework | Next.js App Router | 16.2.5 |
| Language | TypeScript strict | 5.x |
| Styling | TailwindCSS v4 (CSS @theme) | 4.x |
| UI | Radix UI primitives | latest |
| State | Zustand (global) + TanStack Query (server) | 5.x |
| Forms | React Hook Form + Zod | latest |
| Backend | Supabase (Auth + DB + Realtime + Storage) | 2.105.x |
| Animation | Framer Motion | 12.x |
| Map | Mapbox GL / react-map-gl | 3.x / 8.x |

---

## Klasör Yapısı

```
src/
├── app/
│   ├── (auth)/          ← login, register, forgot-password
│   ├── (main)/          ← feed, explore, map, routes, events, clubs, messages, profile, settings, leaderboard, garage
│   └── api/             ← Route Handlers (edge functions)
├── components/
│   ├── ui/              ← Atom bileşenler (Button, Card, Avatar...)
│   └── layouts/         ← Sidebar, BottomNav, RightPanel
├── features/            ← Feature modülleri (her biri bağımsız)
│   ├── auth/
│   ├── feed/
│   ├── routes/
│   ├── events/          ← YAPILACAK
│   ├── clubs/           ← YAPILACAK
│   ├── chat/            ← YAPILACAK
│   ├── map/             ← YAPILACAK
│   ├── profile/         ← YAPILACAK
│   ├── notifications/   ← YAPILACAK
│   └── gamification/    ← YAPILACAK
├── lib/
│   └── supabase/        ← client.ts, server.ts, middleware.ts, types.ts
├── hooks/               ← Paylaşılan custom hooks
├── store/               ← Global Zustand store'ları
├── types/               ← Global TypeScript tipleri (index.ts)
├── utils/               ← Yardımcı fonksiyonlar
├── providers/           ← QueryProvider, ToastProvider
└── config/              ← app.ts (APP_CONFIG, ROUTES sabitleri)
```

Her feature modülü içinde:
```
features/<name>/
├── components/   ← UI bileşenler
├── hooks/        ← use-<feature>.ts
├── services/     ← <feature>.service.ts  (Supabase erişimi burada)
├── store/        ← <feature>.store.ts (Zustand)
├── types/        ← index.ts
└── validations/  ← Zod şemaları
```

---

## Tamamlanan Modüller ✅

- [x] **Design System** — Dark theme, CSS @theme tokens, glassmorphism, skeleton shimmer
- [x] **Auth** — Login, Register, OAuth (Google), Supabase session, Zustand store
- [x] **Feed** — Infinite scroll, CreatePost, PostCard, optimistic like/save mutations
- [x] **Routes** — RouteCard, RoutesList (filter+search), GPX parser, ElevationChart
- [x] **App Layout** — Desktop sidebar + right panel, mobile bottom nav + FAB
- [x] **UI Kit** — Button, Card, Avatar, Badge, Input, Dialog, DropdownMenu, Tabs, Toast, Separator, ScrollArea, Skeleton

---

## Yapılacak Modüller 🔲

### 1. Event System
- [ ] EventCard, EventsList, EventDetail sayfası
- [ ] EventForm (create/edit)
- [ ] Katılım sistemi (join/leave)
- [ ] QR check-in
- [ ] Event chat (Supabase Realtime)
- [ ] Event gallery (Supabase Storage)
- [ ] Event notifications

### 2. Club System
- [ ] ClubCard, ClubsList, ClubDetail
- [ ] ClubForm (create)
- [ ] Member management (roller: founder, admin, moderator, ride_captain, member)
- [ ] Club wall / feed (private posts)
- [ ] Club routes & events tab
- [ ] İzin sistemi (permission guard hook)

### 3. Realtime Chat
- [ ] Conversation listesi
- [ ] MessageBubble, ChatInput
- [ ] Direct message + group chat
- [ ] Supabase Realtime subscription
- [ ] Typing indicator, read receipts
- [ ] Voice message (Supabase Storage)
- [ ] Online status (presence channel)

### 4. Map System
- [ ] Mapbox GL entegrasyonu (`react-map-gl`)
- [ ] Kullanıcı pinleri (canlı konum)
- [ ] Etkinlik pinleri
- [ ] Rota çizimi (GeoJSON layer)
- [ ] Benzinlik / servis noktaları
- [ ] Fullscreen mobile map
- [ ] Canlı sürüş takibi (Realtime)

### 5. Profile System
- [ ] ProfileHeader (cover, avatar, stats)
- [ ] ProfileTabs (posts, routes, clubs, badges)
- [ ] Follow/Unfollow butonu
- [ ] Follower / Following listesi
- [ ] Bike garage tab
- [ ] Privacy settings

### 6. Notification System
- [ ] Notification bell + dropdown
- [ ] NotificationItem bileşeni
- [ ] Supabase Realtime subscription
- [ ] Mark as read / mark all read
- [ ] Push notification (PWA)

### 7. Gamification
- [ ] XP sistemi (DB function: calculate_user_level)
- [ ] Level badge (sidebar + profile)
- [ ] Badge showcase
- [ ] Weekly challenge
- [ ] Leaderboard (global + friends)

### 8. Explore / Search
- [ ] Arama çubuğu (users, routes, events, clubs)
- [ ] Trending posts feed
- [ ] Hashtag page
- [ ] Önerilen kullanıcılar

### 9. Premium System
- [ ] Subscription tier (free/premium/pro)
- [ ] Premium badge
- [ ] Özellik kilitleri (feature flags)
- [ ] Offline maps (PWA cache)

---

## Design System Renk Paleti

```css
--color-bg-base:      #0F1512   /* Ana arka plan */
--color-bg-surface:   #17201B   /* Kart, sidebar */
--color-bg-elevated:  #1E2A23   /* Input, hover yüzey */
--color-bg-hover:     #243329   /* Hover state */
--color-primary:      #3FA36C   /* Ana vurgu (yeşil) */
--color-secondary:    #6BCB91   /* İkincil vurgu */
--color-accent:       #A8E6C1   /* Açık vurgu */
--color-text-primary: #F5F7F6   /* Ana yazı */
--color-text-secondary:#A8B3AD  /* İkincil yazı */
--color-text-muted:   #6B7A72   /* Soluk yazı */
--color-border:       #243329   /* Kenarlık */
--color-danger:       #E05C5C   /* Hata / silme */
```

---

## Bilinen Hatalar ve Çözümleri ⚠️

### 1. Button `asChild` + `leftIcon` = Slot Hatası
**Hata:** `React.Children.only expected to receive a single React element child`

**Sebep:** Radix UI `<Slot>` tek child ister. `leftIcon` prop'u eklenince Slot birden fazla child alıyor.

**Çözüm:** `asChild` kullanılırken `leftIcon`/`rightIcon` KULLANMA. İkonları doğrudan Link içine yaz:
```tsx
// ❌ YANLIŞ
<Button asChild leftIcon={<Plus />}><Link href="/foo">Ekle</Link></Button>

// ✅ DOĞRU
<Button asChild>
  <Link href="/foo"><Plus className="h-4 w-4" /> Ekle</Link>
</Button>
```

Button component'i `asChild` durumunda sadece `{children}` render eder, icon prop'larını yok sayar.

---

### 2. Supabase v2 Database Type → `never` Hatası
**Hata:** `Property 'author_id' does not exist on type 'never[]'`

**Sebep:** `@supabase/supabase-js` v2.100+ Database generic tipi için her tabloda `Relationships: []` array zorunlu. Eksik olduğunda TypeScript Insert tipi `never[]` olarak çözümlenir.

**Çözüm:** `src/lib/supabase/types.ts` içindeki her tablo tanımına `Relationships: []` (veya dolu FK array) eklenmeli. `CompositeTypes: { [_ in never]: never }` de DB root'a eklenmeli.

```ts
// Her tabloda şunu ekle:
MyTable: {
  Row: { ... };
  Insert: { ... };
  Update: { ... };
  Relationships: [];  // ← ZORUNLU
};

// Database root'a:
CompositeTypes: { [_ in never]: never };
```

---

### 3. Next.js 16 Middleware Deprecation Uyarısı
**Uyarı:** `The "middleware" file convention is deprecated. Please use "proxy" instead.`

**Durum:** `src/middleware.ts` dosyası Next.js 16'da `src/proxy.ts` olarak yeniden adlandırılmalı. Şimdilik çalışıyor fakat production'a geçmeden önce rename edilmeli.

**Çözüm:** `src/middleware.ts` → `src/proxy.ts` rename et. `next.config.ts`'te gerekli değişiklik yok.

---

### 4. TailwindCSS v4 Config Farkı
**Durum:** TailwindCSS v4'te `tailwind.config.ts` dosyası yok. Config tamamen CSS `@theme` direktifi ile yapılıyor.

**Çözüm:** Tüm custom değerler `src/app/globals.css` içindeki `@theme { }` bloğuna eklenir:
```css
@theme {
  --color-primary: #3FA36C;
  --radius-lg: 16px;
  /* ... */
}
```

---

### 5. Supabase Anonim Key Olmadan Client Crash
**Hata:** `createBrowserClient` env değişkeni olmadan crash atar.

**Çözüm:** `src/lib/supabase/client.ts`'te fallback değerler var:
```ts
process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
```
Bu sayede build aşaması geçer. Production'da `.env.local` doldurulmalı.

---

## Supabase Kurulum Adımları (Production)

```bash
# 1. Supabase projesi oluştur → dashboard.supabase.com
# 2. .env.local doldur:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# 3. DB tiplerini yenile:
npx supabase gen types typescript --project-id <proje-id> > src/lib/supabase/types.ts

# 4. Mapbox token:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ij...
```

**Supabase'de çalıştırılacak SQL:**
- `src/lib/supabase/types.ts` içindeki tablo tanımlarına bakarak SQL migration yaz
- RLS policy'leri her tablo için ayrıca aktif et
- `profiles` tablosu için `auth.users` trigger'ı kur (yeni kayıtta profil oluştur)

---

## Development Komutları

```bash
npm run dev        # Geliştirme sunucusu (localhost:3000)
npm run build      # Production build (her push öncesi çalıştır)
npm run lint       # ESLint kontrolü
npx tsc --noEmit   # TypeScript tip kontrolü
```

---

## Kod Standartları

- TypeScript `strict: true` — `any` yasak
- Her Supabase erişimi `services/` katmanında, UI'da doğrudan supabase çağrısı yok
- Her mutation optimistic update ile yazılmalı (TanStack Query)
- Zod ile form + API validasyonu
- `cn()` utility (`clsx` + `tailwind-merge`) class birleştirmesi için
- Framer Motion animasyonlar `motion.div` ile, layout animasyonlar `layout` prop ile
- Görsel Supabase Storage URL'leri `next/image` ile, external pattern `next.config.ts`'e eklenmeli
