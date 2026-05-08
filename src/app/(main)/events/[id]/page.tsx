import type { Metadata } from "next";
import { EventDetail } from "@/features/events/components/EventDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Etkinlik — Ciycle`,
    description: `Ciycle etkinlik detayı: ${id}`,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  return <EventDetail id={id} />;
}
