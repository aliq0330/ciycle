"use client";

import { useState, KeyboardEvent } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { X, Globe, Lock, UserX, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import { createEventSchema, type CreateEventInput } from "../validations";
import { useCreateEvent } from "../hooks/use-events";

const VISIBILITY_OPTIONS: Array<{
  value: CreateEventInput["visibility"];
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  { value: "public", label: "Herkese Açık", desc: "Herkes görebilir ve katılabilir", icon: Globe },
  { value: "private", label: "Gizli", desc: "Sadece davetliler görebilir", icon: Lock },
  { value: "invite_only", label: "Davetiye", desc: "Link ile erişim", icon: UserX },
];

export function EventForm() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema) as Resolver<CreateEventInput>,
    defaultValues: {
      visibility: "public",
      tags: [],
    },
  });

  const visibility = watch("visibility");

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: CreateEventInput) => {
    const result = await createEvent.mutateAsync({
      ...data,
      tags,
      end_at: data.end_at || undefined,
      max_participants: data.max_participants,
      route_id: data.route_id,
    });
    router.push(ROUTES.events.detail(result.id));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
      className="space-y-6 max-w-2xl"
    >
      {/* Title */}
      <Input
        label="Etkinlik Başlığı"
        placeholder="Harika bir etkinlik adı..."
        error={errors.title?.message}
        {...register("title")}
      />

      {/* Description */}
      <Textarea
        label="Açıklama"
        placeholder="Etkinlik hakkında detaylar, toplanma noktası, gereksinimler..."
        className="min-h-[120px]"
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Başlangıç Tarihi & Saati *
          </label>
          <input
            type="datetime-local"
            className={cn(
              "flex h-10 w-full rounded-[10px] px-3 py-2 text-sm",
              "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
              "border border-[var(--color-border)]",
              "focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]",
              "[color-scheme:dark]",
              errors.start_at && "border-[var(--color-danger)]"
            )}
            {...register("start_at")}
          />
          {errors.start_at && (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.start_at.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Bitiş Tarihi & Saati
          </label>
          <input
            type="datetime-local"
            className={cn(
              "flex h-10 w-full rounded-[10px] px-3 py-2 text-sm",
              "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
              "border border-[var(--color-border)]",
              "focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]",
              "[color-scheme:dark]",
              errors.end_at && "border-[var(--color-danger)]"
            )}
            {...register("end_at")}
          />
          {errors.end_at && (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.end_at.message}
            </p>
          )}
        </div>
      </div>

      {/* Location + Max participants */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Konum"
          placeholder="İstanbul, Taksim Meydanı"
          error={errors.location_name?.message}
          {...register("location_name")}
        />
        <Input
          type="number"
          label="Maksimum Katılımcı (opsiyonel)"
          placeholder="100"
          min={1}
          max={10000}
          error={errors.max_participants?.message}
          {...register("max_participants", {
            setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
          })}
        />
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Görünürlük
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {VISIBILITY_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("visibility", value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-[12px] border p-3 text-left transition-all",
                visibility === value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-primary)]/40"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  visibility === value
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  visibility === value
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-primary)]"
                )}
              >
                {label}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Etiketler
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Etiket ekle (Enter ile)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            leftIcon={<Tag className="h-4 w-4" />}
          />
          <Button type="button" variant="secondary" size="md" onClick={addTag}>
            Ekle
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/15 px-3 py-1 text-sm text-[var(--color-primary)]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--color-primary)]/30 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Vazgeç
        </Button>
        <Button
          type="submit"
          loading={createEvent.isPending}
        >
          Etkinlik Oluştur
        </Button>
      </div>
    </motion.form>
  );
}
