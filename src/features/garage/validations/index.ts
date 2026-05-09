import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  make: z
    .string()
    .min(1, "Marka zorunludur")
    .max(50, "Marka en fazla 50 karakter"),
  model: z
    .string()
    .min(1, "Model zorunludur")
    .max(80, "Model en fazla 80 karakter"),
  year: z
    .number()
    .int()
    .min(1900, "1900'den eski araç girilemez")
    .max(currentYear + 1, `${currentYear + 1} ve sonrası girilemez`),
  type: z.enum(["motorcycle", "bicycle"] as const).default("motorcycle"),
  color: z.string().max(30, "Renk en fazla 30 karakter").nullable().optional(),
  plate_number: z
    .string()
    .max(20, "Plaka en fazla 20 karakter")
    .nullable()
    .optional(),
  odometer_km: z
    .number()
    .int()
    .min(0, "Negatif km girilemez")
    .default(0),
  engine_cc: z
    .number()
    .int()
    .min(1, "Geçersiz motor hacmi")
    .max(9999, "Geçersiz motor hacmi")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(500, "Notlar en fazla 500 karakter")
    .nullable()
    .optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
