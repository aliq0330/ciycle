import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">@{username}</h1>
      <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
        <p>👤 Profil yakında</p>
      </div>
    </div>
  );
}
