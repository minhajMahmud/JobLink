import { useEffect, useMemo, useState } from "react";
import {
  buildTrendingTopics,
  createReactionCounts,
  currentUser,
  extractHashtags,
  isScheduledAndNotDue,
  posts as initialPosts,
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

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const rankedFeed = useMemo(() => rankFeedPosts(posts, currentUser, now), [posts, now]);

  const visibleFeed = useMemo(() => {
    if (!activeTopic) {
      return rankedFeed;
    }

    const topicKey = activeTopic.toLowerCase();
    return rankedFeed.filter((post) => post.hashtags.some((tag) => tag.toLowerCase() === topicKey));
  }, [activeTopic, rankedFeed]);

  const scheduledPosts = useMemo(() => posts.filter((post) => isScheduledAndNotDue(post, now)), [posts, now]);
  const trendingTopics = useMemo(() => buildTrendingTopics(rankedFeed), [rankedFeed]);

  const createFreshComment = (content: string): Comment => ({
    id: `c-${Date.now()}`,
    author: currentUser,
    content,
    createdAt: 'Just now',
    reactions: { like: 1 },
  });

  const handleNewPost = (payload: CreatePostPayload) => {
    const createdAtISO = new Date().toISOString();
    const normalizedSchedule = payload.scheduledFor ? new Date(payload.scheduledFor).toISOString() : undefined;

    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser,
      content: payload.content,
      image: payload.attachments.find((attachment) => attachment.type === 'image')?.url,
      attachments: payload.attachments,
      poll: payload.poll,
      reactions: createReactionCounts(),
      comments: [],
      shares: 0,
      visibility: payload.visibility,
      hashtags: payload.hashtags.length > 0 ? payload.hashtags : extractHashtags(payload.content),
      relevanceTags: currentUser.skills ?? [],
      scheduledFor: normalizedSchedule,
      createdAtISO,
      createdAt: "Just now",
    };
    setPosts([newPost, ...posts]);
  };

  const handleReact = (postId: string, reaction: ReactionType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const updatedReactions = { ...post.reactions };
        if (post.userReaction) {
          updatedReactions[post.userReaction] = Math.max(0, updatedReactions[post.userReaction] - 1);
        }

        if (post.userReaction === reaction) {
          return { ...post, reactions: updatedReactions, userReaction: undefined };
        }

        updatedReactions[reaction] += 1;
        return { ...post, reactions: updatedReactions, userReaction: reaction };
      }),
    );
  };

  const handleAddComment = (postId: string, content: string, parentCommentId?: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        if (!parentCommentId) {
          return { ...post, comments: [...post.comments, createFreshComment(content)] };
        }

        return {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === parentCommentId
              ? {
                  ...comment,
                  replies: [...(comment.replies ?? []), createFreshComment(content)],
                }
              : comment,
          ),
        };
      }),
    );
  };

  const handleShare = (postId: string, commentary?: string) => {
    const originalPost = posts.find((post) => post.id === postId);
    if (!originalPost) {
      return;
    }

    setPosts((prev) => {
      const updated = prev.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post));

      const repost: Post = {
        id: `${Date.now()}-repost`,
        author: currentUser,
        content: commentary?.trim() || `Reposted from ${originalPost.author.name}: ${originalPost.content.slice(0, 120)}${originalPost.content.length > 120 ? '…' : ''}`,
        attachments: originalPost.attachments,
        image: originalPost.image,
        reactions: createReactionCounts({ celebrate: 1 }),
        comments: [],
        shares: 0,
        repostOfId: originalPost.id,
        visibility: 'public',
        hashtags: Array.from(new Set([...originalPost.hashtags, '#repost'])),
        relevanceTags: originalPost.relevanceTags,
        createdAtISO: new Date().toISOString(),
        createdAt: 'Just now',
      };

      return [repost, ...updated];
    });
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.poll) {
          return post;
        }

        return {
          ...post,
          poll: {
            ...post.poll,
            options: post.poll.options.map((option) =>
              option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
            ),
          },
        };
      }),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Sidebar - Profile Card */}
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="h-20 bg-gradient-to-r from-primary to-accent" />
            <div className="px-4 pb-4 -mt-8">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-16 w-16 rounded-full border-4 border-card object-cover"
              />
              <h3 className="mt-2 text-sm font-semibold font-display text-foreground">{currentUser.name}</h3>
              <p className="text-xs text-muted-foreground">{currentUser.title}</p>
              <p className="text-xs text-muted-foreground">{currentUser.company}</p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
                <span className="text-xs text-muted-foreground">Connections</span>
                <span className="text-sm font-semibold text-primary">{currentUser.connections}</span>
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
          <p className="mt-1">Sorted by engagement, recency, and relevance to your profile skills.</p>
          {activeTopic && (
            <button type="button" onClick={() => setActiveTopic(null)} className="mt-2 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-primary">
              Filtering by {activeTopic} • click to clear
            </button>
          )}
        </div>

        {scheduledPosts.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm font-semibold text-foreground">Scheduled posts</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {scheduledPosts.map((post) => (
                <li key={`scheduled-${post.id}`} className="truncate">• {post.content.slice(0, 72)}{post.content.length > 72 ? '…' : ''}</li>
              ))}
            </ul>
          </div>
        )}

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
