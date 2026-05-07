"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart, MessageCircle, Share2, Bookmark,
  MoreHorizontal, MapPin, Repeat2
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime, formatNumber, cn } from "@/lib/utils";
import { useToggleLike, useToggleSave } from "../hooks/use-feed";
import { ROUTES } from "@/config/app";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { mutate: toggleLike } = useToggleLike();
  const { mutate: toggleSave } = useToggleSave();

  const handleLike = () => toggleLike({ postId: post.id });
  const handleSave = () => toggleSave({ postId: post.id });

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)]",
        "hover:border-[var(--color-border)] transition-colors duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <Link
          href={ROUTES.profile(post.author.username)}
          className="flex items-center gap-3 group"
        >
          <Avatar
            src={post.author.avatar_url}
            name={post.author.full_name}
            size="md"
            verified={post.author.is_verified}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {post.author.full_name}
              </span>
              {post.author.subscription_tier !== "free" && (
                <Badge variant="premium" size="sm">PRO</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{formatRelativeTime(post.created_at)}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    Konum
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-[var(--color-text-muted)]">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Kaydet</DropdownMenuItem>
            <DropdownMenuItem>Kopyala</DropdownMenuItem>
            <DropdownMenuItem>Paylaş</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Takip etme</DropdownMenuItem>
            <DropdownMenuItem destructive>Şikayet et</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Repost indicator */}
      {post.is_repost && (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-xs text-[var(--color-text-muted)]">
          <Repeat2 className="h-3.5 w-3.5" />
          <span>Repost etti</span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${tag}`}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media_urls.length > 0 && (
        <MediaGrid media={post.media_urls} />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-1">
          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-sm transition-colors",
              post.is_liked
                ? "text-red-400 bg-red-400/10"
                : "text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10"
            )}
          >
            <Heart
              className={cn("h-4 w-4 transition-all", post.is_liked && "fill-current")}
            />
            <span className="text-xs font-medium">{formatNumber(post.likes_count)}</span>
          </motion.button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(post.comments_count)}</span>
          </button>

          {/* Share */}
          <button className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 transition-colors">
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(post.shares_count)}</span>
          </button>
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSave}
          className={cn(
            "rounded-[8px] p-1.5 transition-colors",
            post.is_saved
              ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          )}
        >
          <Bookmark className={cn("h-4 w-4", post.is_saved && "fill-current")} />
        </motion.button>
      </div>
    </motion.article>
  );
}

function MediaGrid({ media }: { media: string[] }) {
  const count = media.length;

  if (count === 1) {
    return (
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={media[0]}
          alt="Post media"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {media.map((url, i) => (
          <div key={i} className="relative aspect-square overflow-hidden">
            <Image src={url} alt={`Media ${i + 1}`} fill className="object-cover" sizes="300px" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5">
      <div className="relative aspect-square overflow-hidden">
        <Image src={media[0]} alt="Media 1" fill className="object-cover" sizes="300px" />
      </div>
      <div className="grid grid-rows-2 gap-0.5">
        {media.slice(1, 3).map((url, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image src={url} alt={`Media ${i + 2}`} fill className="object-cover" sizes="150px" />
            {i === 1 && count > 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{count - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
