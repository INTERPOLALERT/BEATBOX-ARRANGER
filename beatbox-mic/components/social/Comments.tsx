'use client';

/**
 * Comments Component
 *
 * Display and manage comments for presets.
 * Features:
 * - List comments with pagination
 * - Add new comment
 * - Edit own comments
 * - Delete own comments
 * - Threaded replies (TODO)
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
  replies?: Comment[];
}

interface CommentsProps {
  presetId: string;
}

export default function Comments({ presetId }: CommentsProps) {
  const { data: session } = useSession();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [presetId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/presets/${presetId}/comments`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !session) return;

    setIsSending(true);
    setError('');

    try {
      const response = await fetch(`/api/presets/${presetId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        setError(data.error || 'Failed to add comment');
      }
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments(comments.map(c =>
          c.id === commentId ? data.comment : c
        ));
        setEditingId(null);
        setEditContent('');
      }
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {session ? (
        <div className="card">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input resize-none mb-3"
            rows={3}
            maxLength={1000}
            disabled={isSending}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-disabled">
              {newComment.length}/1000
            </span>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSending}
              className="btn-primary"
            >
              {isSending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-sm text-ui-red">{error}</div>
          )}
        </div>
      ) : (
        <div className="card text-center">
          <p className="text-text-secondary mb-4">
            Sign in to leave a comment
          </p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-text-secondary">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="card">
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Link href={`/users/${comment.user.id}`} className="flex items-center gap-2 hover:text-ui-blue">
                    <div className="w-8 h-8 rounded-full bg-ui-blue/20 flex items-center justify-center text-ui-blue font-bold text-sm">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">
                        {comment.user.username || comment.user.name}
                      </div>
                      <div className="text-xs text-text-disabled">
                        {formatDate(comment.createdAt)}
                        {comment.updatedAt !== comment.createdAt && ' (edited)'}
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Actions (if own comment) */}
                {session?.user?.email && comment.user.id === session.user.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-sm text-text-secondary hover:text-ui-blue"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-sm text-text-secondary hover:text-ui-red"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input resize-none mb-2"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="btn-primary text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-text-primary whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
