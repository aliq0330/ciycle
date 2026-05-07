import type { Metadata } from "next";
import { CreatePost } from "@/features/feed/components/CreatePost";
import { FeedList } from "@/features/feed/components/FeedList";

export const metadata: Metadata = { title: "Akış" };

export default function FeedPage() {
  return (
    <div className="space-y-4">
      <CreatePost />
      <FeedList />
    </div>
  );
}
