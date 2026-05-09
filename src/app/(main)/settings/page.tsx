"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Bell, Palette, Shield, Bike, CreditCard, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUpdateProfile } from "@/features/profile/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { GarageList } from "@/features/garage/components/GarageList";

const SETTINGS_SECTIONS = [
  { id: "profile", icon: User, label: "Profil" },
  { id: "account", icon: Lock, label: "Hesap & Güvenlik" },
  { id: "notifications", icon: Bell, label: "Bildirimler" },
  { id: "appearance", icon: Palette, label: "Görünüm" },
  { id: "privacy", icon: Shield, label: "Gizlilik" },
  { id: "vehicles", icon: Bike, label: "Araçlarım" },
  { id: "subscription", icon: CreditCard, label: "Abonelik" },
] as const;

type SectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

const profileSchema = z.object({
  full_name: z.string().min(2, "En az 2 karakter"),
  username: z.string().min(3, "En az 3 karakter").regex(/^[a-z0-9_]+$/, "Sadece küçük harf, rakam, _"),
  bio: z.string().max(300, "En fazla 300 karakter").optional(),
  location: z.string().max(80).optional(),
  website: z.string().url("Geçerli URL giriniz").optional().or(z.literal("")),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const { user, logout } = useAuth();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Ayarlar</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 gap-1">
          {SETTINGS_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-left transition-colors",
                activeSection === s.id
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <s.icon className="h-4 w-4 flex-shrink-0" />
              {s.label}
            </button>
          ))}

          <Separator className="my-2" />

          <button
            onClick={() => logout()}
            className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "profile" && <ProfileSettings user={user} />}
          {activeSection === "account" && <AccountSettings />}
          {activeSection === "notifications" && <NotificationSettings />}
          {activeSection === "appearance" && <AppearanceSettings />}
          {activeSection === "privacy" && <PrivacySettings />}
          {activeSection === "vehicles" && <VehicleSettings />}
          {activeSection === "subscription" && <SubscriptionSettings user={user} />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      location: user?.location ?? "",
      website: user?.website ?? "",
    },
  });
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const onSubmit = (data: ProfileInput) => {
    updateProfile(data, {
      onSuccess: () => toast({ title: "Profil güncellendi", variant: "success" }),
      onError: () => toast({ title: "Güncelleme başarısız", variant: "error" }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.full_name ?? ""} size="xl" />
          <div>
            <Button variant="secondary" size="sm">Fotoğraf Değiştir</Button>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">JPG, PNG — Maks 5MB</p>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ad Soyad"
              error={errors.full_name?.message}
              {...register("full_name")}
            />
            <Input
              label="Kullanıcı Adı"
              leftIcon={<span className="text-xs">@</span>}
              error={errors.username?.message}
              {...register("username")}
            />
          </div>

          <Input
            label="Konum"
            placeholder="İstanbul, Türkiye"
            error={errors.location?.message}
            {...register("location")}
          />

          <Input
            label="Web Sitesi"
            placeholder="https://..."
            error={errors.website?.message}
            {...register("website")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Hakkımda</label>
            <textarea
              placeholder="Kendinden bahset..."
              rows={3}
              className="flex w-full rounded-[10px] px-3 py-2.5 text-sm bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] resize-none focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]"
              {...register("bio")}
            />
            {errors.bio && <p className="text-xs text-[var(--color-danger)]">{errors.bio.message}</p>}
          </div>

          <Button type="submit" disabled={!isDirty || isPending} loading={isPending}>Kaydet</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountSettings() {
  return (
    <Card>
      <CardHeader><CardTitle>Hesap & Güvenlik</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Şifre Değiştir</h3>
          <Input type="password" label="Mevcut Şifre" placeholder="••••••••" />
          <Input type="password" label="Yeni Şifre" placeholder="••••••••" />
          <Input type="password" label="Yeni Şifre Tekrar" placeholder="••••••••" />
          <Button variant="secondary">Şifreyi Güncelle</Button>
        </div>
        <Separator />
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">İki Faktörlü Doğrulama</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">Hesabını daha güvenli hale getir.</p>
          <Button variant="outline">2FA Aktifleştir</Button>
        </div>
        <Separator />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--color-danger)]">Tehlikeli Bölge</h3>
          <p className="text-sm text-[var(--color-text-muted)]">Hesabını silmek geri alınamaz.</p>
          <Button variant="danger" size="sm">Hesabı Sil</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const items = [
    { label: "Beğeniler", desc: "Gönderilerine biri beğeni attığında" },
    { label: "Yorumlar", desc: "Gönderilerine yorum yapıldığında" },
    { label: "Takipçiler", desc: "Biri seni takip ettiğinde" },
    { label: "Etiketler", desc: "Bir gönderide etiketlendiğinde" },
    { label: "Etkinlik davetleri", desc: "Etkinliğe davet edildiğinde" },
    { label: "Kulüp haberleri", desc: "Üye olduğun kulüplerde paylaşım" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>Bildirim Ayarları</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
            </div>
            <Toggle />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  return (
    <Card>
      <CardHeader><CardTitle>Görünüm</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Tema</p>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Karanlık (Varsayılan)", active: true }, { label: "Çok Karanlık", active: false }].map((t) => (
              <button key={t.label} className={cn("rounded-[12px] border p-4 text-sm font-medium transition-colors", t.active ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <Separator />
        <p className="text-sm text-[var(--color-text-muted)]">Daha fazla tema seçeneği yakında gelecek.</p>
      </CardContent>
    </Card>
  );
}

function PrivacySettings() {
  const items = [
    { label: "Özel Hesap", desc: "Sadece takipçilerin gönderilerini görsün" },
    { label: "Konum Gizle", desc: "Haritada görünme" },
    { label: "Aktivite Durumu", desc: "Online olduğunu göster" },
    { label: "Okundu Bilgisi", desc: "Mesajları okuduğunu göster" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>Gizlilik</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
            </div>
            <Toggle />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function VehicleSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Araçlarım</CardTitle>
      </CardHeader>
      <CardContent>
        <GarageList />
      </CardContent>
    </Card>
  );
}

function SubscriptionSettings({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const tier = user?.subscription_tier ?? "free";
  return (
    <Card>
      <CardHeader><CardTitle>Abonelik</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-[12px] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Mevcut Plan: <Badge variant={tier === "free" ? "secondary" : "premium"}>{tier.toUpperCase()}</Badge>
            </p>
            {tier === "free" && <p className="text-xs text-[var(--color-text-muted)] mt-1">Premium'a geç — reklamsız, gelişmiş analitik, offline harita</p>}
          </div>
        </div>
        {tier === "free" && (
          <div className="grid gap-3">
            {[
              { name: "Premium", price: "₺49/ay", features: ["Reklamsız", "Gelişmiş analitik", "Öncelikli destek"] },
              { name: "Pro", price: "₺99/ay", features: ["Premium dahil", "Offline harita", "AI rota önerisi", "Özel rozet"] },
            ].map((plan) => (
              <div key={plan.name} className="rounded-[14px] border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)]">{plan.name}</p>
                    <p className="text-lg font-bold text-[var(--color-primary)]">{plan.price}</p>
                  </div>
                  <Button size="sm">Seç</Button>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => <li key={f} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5"><span className="text-[var(--color-primary)]">✓</span> {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn("relative h-6 w-11 rounded-full transition-colors flex-shrink-0", on ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg-subtle)]")}
    >
      <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}
