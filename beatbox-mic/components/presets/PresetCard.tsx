'use client';

/**
 * Preset Card Component
 *
 * Displays a preset preview in grid/list layouts.
 * Features:
 * - Preset name, author, and metadata
 * - Like/download counts
 * - Tags
 * - Preview waveform visualization
 * - Hover effects
 * - Click to view details
 */

import Link from 'next/link';
import { useState } from 'react';

interface PresetCardProps {
  id: string;
  name: string;
  description?: string;
  author: {
    id: string;
    name: string;
    username?: string;
  };
  tags: string[];
  likeCount: number;
  downloadCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: Date;
  onLike?: () => void;
}

export default function PresetCard({
  id,
  name,
  description,
  author,
  tags,
  likeCount,
  downloadCount,
  viewCount,
  isLiked = false,
  createdAt,
  onLike
}: PresetCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    if (onLike) {
      onLike();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Link href={`/presets/${id}`}>
      <div className="card group cursor-pointer transition-all duration-200 hover:border-ui-blue hover:shadow-glow-blue">
        {/* Waveform Preview (Placeholder) */}
        <div className="relative h-32 bg-bg-primary rounded-lg mb-4 overflow-hidden">
          {/* Placeholder waveform - replace with actual waveform image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-ui-blue/30 group-hover:bg-ui-blue transition-colors"
                  style={{
                    height: `${20 + Math.sin(i * 0.5) * 30}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Like Button Overlay */}
          <button
            onClick={handleLike}
            className={`
              absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm
              transition-all duration-200
              ${liked
                ? 'bg-ui-red/80 text-white scale-110'
                : 'bg-bg-elevated/80 text-text-secondary hover:bg-ui-red/80 hover:text-white'
              }
            `}
          >
            <svg
              className="w-5 h-5"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Preset Info */}
        <div className="space-y-3">
          {/* Name */}
          <h3 className="font-bold text-lg group-hover:text-ui-blue transition-colors line-clamp-2">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-text-secondary line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-bg-primary rounded-full text-text-secondary"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs px-2 py-1 text-text-disabled">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-ui-blue/20 flex items-center justify-center text-ui-blue font-bold text-xs">
              {author.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-text-secondary">
              {author.username || author.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-border-color text-sm">
            <div className="flex items-center gap-4 text-text-secondary">
              {/* Likes */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{formatNumber(likes)}</span>
              </div>

              {/* Downloads */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{formatNumber(downloadCount)}</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{formatNumber(viewCount)}</span>
              </div>
            </div>

            {/* Date */}
            <span className="text-xs text-text-disabled">
              {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
