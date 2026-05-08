"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/app";

interface ChatInputProps {
  onSend: (content: string) => void;
  isSending?: boolean;
  typingUserNames?: string[];
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  isSending = false,
  typingUserNames = [],
  placeholder = "Mesaj yaz...",
  maxLength = APP_CONFIG.limits.postMaxLength,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, isSending, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > maxLength) return;
    setText(val);

    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  };

  const canSend = text.trim().length > 0 && !isSending;
  const charPercent = (text.length / maxLength) * 100;
  const showCounter = text.length > maxLength * 0.8;

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      {/* Typing indicator */}
      <AnimatePresence>
        {typingUserNames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-1.5"
          >
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              <TypingDots />
              <span>
                {typingUserNames.slice(0, 2).join(", ")}{" "}
                {typingUserNames.length === 1 ? "yazıyor" : "yazıyorlar"}...
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        {/* Attachment button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          title="Dosya ekle"
          className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <Paperclip className="h-4 w-4" />
        </motion.button>

        {/* Textarea wrapper */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full resize-none rounded-[16px] px-4 py-2.5 pr-10 text-sm",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30",
              "transition-colors duration-150 leading-relaxed",
              "scrollbar-thin"
            )}
            style={{ maxHeight: 120 }}
          />

          {/* Emoji button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Emoji"
            className="absolute right-2.5 bottom-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Smile className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Send button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-all duration-150",
            canSend
              ? "bg-[var(--color-primary)] text-white shadow-[0_0_12px_rgba(63,163,108,0.3)] hover:opacity-90"
              : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed"
          )}
        >
          {isSending ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </motion.button>
      </div>

      {/* Character counter */}
      <AnimatePresence>
        {showCounter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-end px-4 pb-2 gap-2"
          >
            <div className="relative h-1 w-24 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-200",
                  charPercent >= 100
                    ? "bg-[var(--color-danger)]"
                    : charPercent >= 90
                      ? "bg-yellow-500"
                      : "bg-[var(--color-primary)]"
                )}
                style={{ width: `${Math.min(charPercent, 100)}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[10px]",
                charPercent >= 100
                  ? "text-[var(--color-danger)]"
                  : "text-[var(--color-text-muted)]"
              )}
            >
              {text.length}/{maxLength}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1 w-1 rounded-full bg-[var(--color-text-muted)]"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
