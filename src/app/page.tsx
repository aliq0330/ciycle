import { redirect } from "next/navigation";
import { ROUTES } from "@/config/app";

export default function RootPage() {
  redirect(ROUTES.feed);
}
