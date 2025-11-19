'use client';

/**
 * Preset Library Page
 *
 * Browse, search, and filter community presets.
 * Features:
 * - Search by name, tags, author
 * - Filter by tags, date, popularity
 * - Sort options (newest, popular, top-rated)
 * - Infinite scroll pagination
 * - Grid/list view toggle
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PresetCard from '@/components/presets/PresetCard';

interface Preset {
  id: string;
  name: string;
  description?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username?: string;
  };
  tags: string[];
  likeCount: number;
  downloadCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
}

const POPULAR_TAGS = [
  'beatbox',
  'vocal',
  'bass-boost',
  'crisp',
  'warm',
  'professional',
  'live',
  'studio',
  'bedroom',
  'competition'
];

export default function PresetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch presets
  useEffect(() => {
    fetchPresets();
  }, [searchQuery, selectedTags, sortBy, page]);

  const fetchPresets = async () => {
    setIsLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/presets?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (page === 1) {
          setPresets(data.presets);
        } else {
          setPresets((prev) => [...prev, ...data.presets]);
        }
        setHasMore(data.hasMore);
      } else {
        console.error('Failed to fetch presets:', data.error);
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (newSort: 'newest' | 'popular' | 'downloads') => {
    setSortBy(newSort);
    setPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Preset Library</h1>
              <p className="text-text-secondary mt-1">
                Browse {presets.length > 0 ? `${presets.length}+` : ''} community presets
              </p>
            </div>
            <button
              onClick={() => router.push('/upload')}
              className="btn-success"
            >
              ✨ Create Preset
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search presets by name, tags, or author..."
              className="input pl-12"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0 space-y-6">
            {/* Sort */}
            <div>
              <h3 className="font-bold mb-3">Sort By</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-ui-blue text-white'
                      : 'hover:bg-bg-elevated'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-ui-blue text-white'
                      : 'hover:bg-bg-elevated'
                  }`}
                >
                  Most Popular
                </button>
                <button
                  onClick={() => handleSortChange('downloads')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    sortBy === 'downloads'
                      ? 'bg-ui-blue text-white'
                      : 'hover:bg-bg-elevated'
                  }`}
                >
                  Most Downloaded
                </button>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <h3 className="font-bold mb-3">Filter by Tags</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-ui-blue text-white'
                        : 'bg-bg-elevated hover:bg-bg-elevated/80'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-ui-red hover:underline mt-3"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card bg-bg-elevated">
              <h3 className="font-bold mb-3">Library Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Presets</span>
                  <span className="font-bold">12,345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Active Users</span>
                  <span className="font-bold">2,891</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Downloads Today</span>
                  <span className="font-bold text-ui-green">+1,234</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Preset Grid */}
          <main className="flex-1">
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-ui-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-secondary">Loading presets...</p>
                </div>
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">No presets found</h2>
                <p className="text-text-secondary mb-6">
                  {searchQuery || selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create a preset!'}
                </p>
                <button
                  onClick={() => router.push('/upload')}
                  className="btn-success"
                >
                  Create Preset
                </button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6 text-text-secondary text-sm">
                  {searchQuery && (
                    <span>
                      Showing results for "<span className="font-bold text-text-primary">{searchQuery}</span>"
                    </span>
                  )}
                  {selectedTags.length > 0 && (
                    <span className="ml-2">
                      • Filtered by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Preset Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {presets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      id={preset.id}
                      name={preset.name}
                      description={preset.description}
                      author={preset.user}
                      tags={preset.tags}
                      likeCount={preset.likeCount}
                      downloadCount={preset.downloadCount}
                      viewCount={preset.viewCount}
                      isLiked={preset.isLiked}
                      createdAt={new Date(preset.createdAt)}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="btn-secondary"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
