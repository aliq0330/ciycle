import { z } from "zod";

export const createClubSchema = z.object({
  name: z
    .string()
    .min(3, "Kulüp adı en az 3 karakter olmalıdır")
    .max(50, "Kulüp adı en fazla 50 karakter olabilir"),
  description: z
    .string()
    .min(10, "Açıklama en az 10 karakter olmalıdır")
    .max(1000, "Açıklama en fazla 1000 karakter olabilir"),
  vehicle_type: z.enum(["motorcycle", "bicycle", "both"] as const),
  visibility: z.enum(["public", "private", "invite_only"] as const),
  location: z.string().optional(),
});

export type CreateClubInput = z.infer<typeof createClubSchema>;
