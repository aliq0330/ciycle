"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Map, Calendar, Smile } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCreatePost } from "../hooks/use-feed";
import { useCreatePostStore } from "@/store/create-post.store";
import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";

export function CreatePostDialog() {
  const { isOpen, close } = useCreatePostStore();
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: createPost, isPending } = useCreatePost();

  const charCount = content.length;
  const charLimit = APP_CONFIG.limits.postMaxLength;
  const isOverLimit = charCount > charLimit;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const tags = content.match(/#(\w+)/g)?.map((t) => t.slice(1)) ?? [];
    createPost(
      { content: content.trim(), tags },
      {
        onSuccess: () => {
          setContent("");
          close();
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setContent("");
      close();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogTitle className="sr-only">Yeni Gönderi</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
          <Avatar src={user.avatar_url} name={user.full_name} size="md" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {user.full_name}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">@{user.username}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <textarea
            ref={textareaRef}
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
            }}
            placeholder="Ne paylaşmak istiyorsun?"
            rows={5}
            className={cn(
              "w-full bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "text-sm resize-none outline-none leading-relaxed"
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
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

          <div className="flex items-center gap-3">
            {charCount > 0 && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isOverLimit
                    ? "text-[var(--color-danger)]"
                    : charCount > charLimit * 0.9
                    ? "text-amber-500"
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
      </DialogContent>
    </Dialog>
  );
}
