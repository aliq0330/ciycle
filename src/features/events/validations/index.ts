import { z } from "zod";

const isoDateInFuture = z
  .string()
  .min(1, "Tarih zorunludur")
  .refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d > new Date();
  }, "Tarih gelecekte olmalıdır");

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Başlık en az 3 karakter olmalıdır")
      .max(80, "Başlık en fazla 80 karakter olabilir"),
    description: z
      .string()
      .min(10, "Açıklama en az 10 karakter olmalıdır")
      .max(2000, "Açıklama en fazla 2000 karakter olabilir"),
    start_at: isoDateInFuture,
    end_at: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const d = new Date(val);
        return !isNaN(d.getTime());
      }, "Geçerli bir tarih girin"),
    location_name: z
      .string()
      .min(2, "Konum adı en az 2 karakter olmalıdır"),
    max_participants: z
      .number()
      .int()
      .min(1, "En az 1 katılımcı olmalıdır")
      .max(10000, "En fazla 10.000 katılımcı olabilir")
      .optional(),
    visibility: z.enum(["public", "private", "invite_only"] as const).default("public"),
    tags: z.array(z.string()).default([]),
    route_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (!data.end_at) return true;
      return new Date(data.end_at) > new Date(data.start_at);
    },
    {
      message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      path: ["end_at"],
    }
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
