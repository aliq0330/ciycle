import type { Metadata } from "next";
import { GarageList } from "@/features/garage/components/GarageList";

export const metadata: Metadata = { title: "Garaj" };

export default function GaragePage() {
  return (
    <div className="space-y-5">
      <GarageList />
    </div>
  );
}
