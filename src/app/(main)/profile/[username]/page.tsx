import type { Metadata } from "next";
import { ProfilePageClient } from "./ProfilePageClient";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — Ciycle`,
    description: `${username} profilini görüntüle`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfilePageClient username={username} />;
}
