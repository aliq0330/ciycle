"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Map, Calendar, Smile, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCreatePost } from "../hooks/use-feed";
import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";

export function CreatePost() {
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: createPost, isPending } = useCreatePost();

  const charCount = content.length;
  const charLimit = APP_CONFIG.limits.postMaxLength;
  const isOverLimit = charCount > charLimit;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const tags = content.match(/#(\w+)/g)?.map((t) => t.slice(1)) ?? [];
    createPost({ content: content.trim(), tags });
    setContent("");
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsFocused(false);
      textareaRef.current?.blur();
    }
  };

  if (!user) return null;

  return (
    <div
      className={cn(
        "bg-[var(--color-bg-surface)] rounded-[20px] border transition-all duration-200",
        isFocused
          ? "border-[var(--color-primary)] shadow-[0_0_0_3px_rgba(63,163,108,0.1)]"
          : "border-[var(--color-border)]"
      )}
    >
      <div className="flex gap-3 p-4">
        <Avatar src={user.avatar_url} name={user.full_name} size="md" />

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Ne paylaşmak istiyorsun?"
            rows={isFocused ? 4 : 2}
            className={cn(
              "w-full bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "text-sm resize-none outline-none leading-relaxed transition-all duration-200"
            )}
          />

          {isFocused && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
              {/* Media actions */}
              <div className="flex items-center gap-1">
                {[
                  { icon: ImageIcon, label: "Fotoğraf" },
                  { icon: Map, label: "Rota" },
                  { icon: Calendar, label: "Etkinlik" },
                  { icon: Smile, label: "Emoji" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    title={label}
                    className="flex items-center justify-center h-8 w-8 rounded-[8px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3">
                {charCount > 0 && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isOverLimit
                        ? "text-[var(--color-danger)]"
                        : charCount > charLimit * 0.9
                        ? "text-[var(--color-warning)]"
                        : "text-[var(--color-text-muted)]"
                    )}
                  >
                    {charLimit - charCount}
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  loading={isPending}
                >
                  Paylaş
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
