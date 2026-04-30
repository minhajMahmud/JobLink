import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildTrendingTopics,
  createReactionCounts,
  currentUser,
  extractHashtags,
  isScheduledAndNotDue,
  posts as mockPosts,
  rankFeedPosts,
  type Comment,
  type Post,
  type ReactionType,
} from "@/data/mockData";
import CreatePost from "@/components/feed/CreatePost";
import type { CreatePostPayload } from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import SuggestedConnections from "@/components/feed/SuggestedConnections";
import TrendingTopics from "@/components/feed/TrendingTopics";
import {
  getFeedPosts,
  createPost as apiCreatePost,
  reactToPost as apiReactToPost,
  addComment as apiAddComment,
  sharePost as apiSharePost,
  votePoll as apiVotePoll,
} from "@/features/feed/api/feedApi";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Track whether we're using live data or mock fallback
  const usingMock = useRef(false);

  // -------------------------------------------------------------------------
  // Load feed on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setIsLoading(true);
      try {
        const res = await getFeedPosts(1, 20);
        if (!cancelled) {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            usingMock.current = false;
            setPosts(res.data);
          } else {
            // API returned success but empty — fall back to mock so the feed
            // isn't blank during development / before data is seeded.
            usingMock.current = true;
            setPosts(mockPosts);
          }
        }
      } catch {
        if (!cancelled) {
          usingMock.current = true;
          setPosts(mockPosts);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadFeed();
    return () => { cancelled = true; };
  }, []);

  // Tick every minute for relative timestamps
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  // -------------------------------------------------------------------------
  // Derived feed
  // -------------------------------------------------------------------------
  const viewer = useMemo(() => ({
    ...currentUser,
    ...(user ? { id: user.id, role: user.role as typeof currentUser.role } : {}),
  }), [user]);

  const rankedFeed = useMemo(() => rankFeedPosts(posts, viewer, now), [posts, viewer, now]);

  const visibleFeed = useMemo(() => {
    if (!activeTopic) return rankedFeed;
    const topicKey = activeTopic.toLowerCase();
    return rankedFeed.filter((post) =>
      post.hashtags.some((tag) => tag.toLowerCase() === topicKey)
    );
  }, [activeTopic, rankedFeed]);

  const scheduledPosts = useMemo(
    () => posts.filter((post) => isScheduledAndNotDue(post, now)),
    [posts, now]
  );

  const trendingTopics = useMemo(() => buildTrendingTopics(rankedFeed), [rankedFeed]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const createFreshComment = useCallback((content: string): Comment => ({
    id: `c-${Date.now()}`,
    author: viewer,
    content,
    createdAt: "Just now",
    reactions: { like: 1 },
  }), [viewer]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleNewPost = useCallback(async (payload: CreatePostPayload) => {
    const createdAtISO = new Date().toISOString();
    const normalizedSchedule = payload.scheduledFor
      ? new Date(payload.scheduledFor).toISOString()
      : undefined;

    // Optimistic local post
    const optimisticPost: Post = {
      id: `optimistic-${Date.now()}`,
      author: viewer,
      content: payload.content,
      image: payload.attachments.find((a) => a.type === "image")?.url,
      attachments: payload.attachments,
      poll: payload.poll,
      reactions: createReactionCounts(),
      comments: [],
      shares: 0,
      visibility: payload.visibility,
      hashtags:
        payload.hashtags.length > 0
          ? payload.hashtags
          : extractHashtags(payload.content),
      relevanceTags: viewer.skills ?? [],
      scheduledFor: normalizedSchedule,
      createdAtISO,
      createdAt: "Just now",
    };

    setPosts((prev) => [optimisticPost, ...prev]);

    if (!usingMock.current) {
      try {
        const res = await apiCreatePost({
          content: payload.content,
          visibility: payload.visibility,
          attachments: payload.attachments,
          poll: payload.poll,
          scheduledFor: normalizedSchedule,
          hashtags: optimisticPost.hashtags,
          relevanceTags: viewer.skills ?? [],
          imageUrl: optimisticPost.image,
        });

        if (res.success && res.data) {
          // Replace optimistic post with real one from server
          setPosts((prev) =>
            prev.map((p) => (p.id === optimisticPost.id ? res.data! : p))
          );
        }
      } catch {
        // Keep optimistic post on failure — user already sees it
      }
    }
  }, [viewer]);

  const handleReact = useCallback(async (postId: string, reaction: ReactionType) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedReactions = { ...post.reactions };
        if (post.userReaction) {
          updatedReactions[post.userReaction] = Math.max(0, updatedReactions[post.userReaction] - 1);
        }
        if (post.userReaction === reaction) {
          return { ...post, reactions: updatedReactions, userReaction: undefined };
        }
        updatedReactions[reaction] += 1;
        return { ...post, reactions: updatedReactions, userReaction: reaction };
      })
    );

    if (!usingMock.current) {
      try {
        await apiReactToPost(postId, reaction);
      } catch {
        // Optimistic update stays — non-critical
      }
    }
  }, []);

  const handleAddComment = useCallback(async (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => {
    const freshComment = createFreshComment(content);

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        if (!parentCommentId) {
          return { ...post, comments: [...post.comments, freshComment] };
        }
        return {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === parentCommentId
              ? { ...comment, replies: [...(comment.replies ?? []), freshComment] }
              : comment
          ),
        };
      })
    );

    if (!usingMock.current) {
      try {
        const res = await apiAddComment(postId, content, parentCommentId);
        if (res.success && res.data) {
          // Replace optimistic comment with server comment
          setPosts((prev) =>
            prev.map((post) => {
              if (post.id !== postId) return post;
              if (!parentCommentId) {
                return {
                  ...post,
                  comments: post.comments.map((c) =>
                    c.id === freshComment.id ? res.data! : c
                  ),
                };
              }
              return {
                ...post,
                comments: post.comments.map((c) =>
                  c.id === parentCommentId
                    ? {
                      ...c,
                      replies: (c.replies ?? []).map((r) =>
                        r.id === freshComment.id ? res.data! : r
                      ),
                    }
                    : c
                ),
              };
            })
          );
        }
      } catch {
        // Optimistic comment stays
      }
    }
  }, [createFreshComment]);

  const handleShare = useCallback(async (postId: string, commentary?: string) => {
    const originalPost = posts.find((p) => p.id === postId);
    if (!originalPost) return;

    // Optimistic repost
    const repost: Post = {
      id: `${Date.now()}-repost`,
      author: viewer,
      content:
        commentary?.trim() ||
        `Reposted from ${originalPost.author.name}: ${originalPost.content.slice(0, 120)}${originalPost.content.length > 120 ? "…" : ""}`,
      attachments: originalPost.attachments,
      image: originalPost.image,
      reactions: createReactionCounts({ celebrate: 1 }),
      comments: [],
      shares: 0,
      repostOfId: originalPost.id,
      visibility: "public",
      hashtags: Array.from(new Set([...originalPost.hashtags, "#repost"])),
      relevanceTags: originalPost.relevanceTags,
      createdAtISO: new Date().toISOString(),
      createdAt: "Just now",
    };

    setPosts((prev) => {
      const updated = prev.map((p) =>
        p.id === postId ? { ...p, shares: p.shares + 1 } : p
      );
      return [repost, ...updated];
    });

    if (!usingMock.current) {
      try {
        const res = await apiSharePost(postId, commentary);
        if (res.success && res.data) {
          setPosts((prev) =>
            prev.map((p) => (p.id === repost.id ? res.data! : p))
          );
        }
      } catch {
        // Optimistic repost stays
      }
    }
  }, [posts, viewer]);

  const handleVotePoll = useCallback(async (postId: string, optionId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.poll) return post;
        return {
          ...post,
          poll: {
            ...post.poll,
            options: post.poll.options.map((option) =>
              option.id === optionId
                ? { ...option, votes: option.votes + 1 }
                : option
            ),
          },
        };
      })
    );

    if (!usingMock.current) {
      try {
        const res = await apiVotePoll(postId, optionId);
        if (res.success && res.data?.poll) {
          // Sync with server poll state
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId ? { ...post, poll: res.data!.poll } : post
            )
          );
        }
      } catch {
        // Optimistic vote stays
      }
    }
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Sidebar - Profile Card */}
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="h-20 bg-gradient-to-r from-primary to-accent" />
            <div className="px-4 pb-4 -mt-8">
              <img
                src={viewer.avatar}
                alt={viewer.name}
                className="h-16 w-16 rounded-full border-4 border-card object-cover"
              />
              <h3 className="mt-2 text-sm font-semibold font-display text-foreground">
                {viewer.name}
              </h3>
              <p className="text-xs text-muted-foreground">{viewer.title}</p>
              <p className="text-xs text-muted-foreground">{viewer.company}</p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
                <span className="text-xs text-muted-foreground">Connections</span>
                <span className="text-sm font-semibold text-primary">
                  {viewer.connections}
                </span>
              </div>
            </div>
          </div>
          <TrendingTopics topics={trendingTopics} onSelectTopic={setActiveTopic} />
        </div>
      </aside>

      {/* Main Feed */}
      <div className="lg:col-span-6 space-y-4">
        <CreatePost onPost={handleNewPost} />

        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-card">
          <p className="font-semibold text-foreground">AI-ranked feed</p>
          <p className="mt-1">
            Sorted by engagement, recency, and relevance to your profile skills.
          </p>
          {activeTopic && (
            <button
              type="button"
              onClick={() => setActiveTopic(null)}
              className="mt-2 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              Filtering by {activeTopic} • click to clear
            </button>
          )}
        </div>

        {scheduledPosts.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm font-semibold text-foreground">Scheduled posts</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {scheduledPosts.map((post) => (
                <li key={`scheduled-${post.id}`} className="truncate">
                  • {post.content.slice(0, 72)}
                  {post.content.length > 72 ? "…" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 shadow-card animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-secondary" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 rounded bg-secondary" />
                    <div className="h-2 w-24 rounded bg-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-secondary" />
                  <div className="h-3 w-4/5 rounded bg-secondary" />
                  <div className="h-3 w-3/5 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {visibleFeed.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReact={handleReact}
                onAddComment={handleAddComment}
                onShare={handleShare}
                onVotePoll={handleVotePoll}
              />
            ))}

            {visibleFeed.length === 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
                No posts match this filter yet. Try another trending topic.
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-24 space-y-4">
          <SuggestedConnections />
        </div>
      </aside>
    </div>
  );
}
