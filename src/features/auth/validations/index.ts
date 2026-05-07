import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    username: z
      .string()
      .min(3, "Kullanıcı adı en az 3 karakter olmalıdır")
      .max(30, "Kullanıcı adı en fazla 30 karakter olabilir")
      .regex(/^[a-z0-9_]+$/, "Sadece küçük harf, rakam ve alt çizgi kullanılabilir"),
    full_name: z
      .string()
      .min(2, "Ad soyad en az 2 karakter olmalıdır")
      .max(80, "Ad soyad en fazla 80 karakter olabilir"),
    vehicle_type: z.enum(["motorcycle", "bicycle", "both"]),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "En az bir büyük harf içermelidir")
      .regex(/[0-9]/, "En az bir rakam içermelidir"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Şifreler eşleşmiyor",
    path: ["confirm_password"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "En az bir büyük harf içermelidir")
      .regex(/[0-9]/, "En az bir rakam içermelidir"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Şifreler eşleşmiyor",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
