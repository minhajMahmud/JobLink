import { useState } from "react";
import { Globe2, Lock, MessageCircle, MoreHorizontal, Repeat2, Send, Users } from "lucide-react";
import { currentUser, reactionMeta, totalComments, totalReactions, type Post, type ReactionType } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface PostCardProps {
  post: Post;
  onReact: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, content: string, parentCommentId?: string) => void;
  onShare: (postId: string, commentary?: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
}

const visibilityMeta = {
  public: { label: 'Public', icon: Globe2 },
  connections: { label: 'Connections only', icon: Users },
  private: { label: 'Private', icon: Lock },
} as const;

export default function PostCard({ post, onReact, onAddComment, onShare, onVotePoll }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [showShareComposer, setShowShareComposer] = useState(false);
  const [shareCommentary, setShareCommentary] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) {
      return;
    }

    onAddComment(post.id, newComment.trim());
    setNewComment("");
  };

  const handleAddReply = (parentCommentId: string) => {
    const content = replyDrafts[parentCommentId]?.trim();
    if (!content) {
      return;
    }

    onAddComment(post.id, content, parentCommentId);
    setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: "" }));
  };

  const handleShare = () => {
    onShare(post.id, shareCommentary.trim() || undefined);
    setShareCommentary("");
    setShowShareComposer(false);
  };

  const totalVotes = post.poll?.options.reduce((sum, option) => sum + option.votes, 0) ?? 0;
  const visibility = visibilityMeta[post.visibility];
  const VisibilityIcon = visibility.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">{post.author.name}</h3>
            <p className="text-xs text-muted-foreground">{post.author.title}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.createdAt}</span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1">
                <VisibilityIcon className="h-3 w-3" />
                {visibility.label}
              </span>
              {post.scheduledFor && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">Scheduled</span>}
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="More options"
          title="More options"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed text-foreground">{post.content}</p>
        {post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span key={`${post.id}-${tag}`} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-primary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {(post.attachments?.some((attachment) => attachment.type === 'image') || post.image) && (
        <div className="px-4 pb-3">
          <img
            src={post.attachments?.find((attachment) => attachment.type === 'image')?.url ?? post.image}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {post.attachments?.some((attachment) => attachment.type === 'video' || attachment.type === 'document') && (
        <div className="space-y-2 px-4 pb-3">
          {post.attachments
            .filter((attachment) => attachment.type === 'video' || attachment.type === 'document')
            .map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground hover:bg-secondary"
              >
                <span>{attachment.type === 'video' ? '🎬 Video' : '📄 Document'} • {attachment.title ?? attachment.url}</span>
                <span className="text-primary">Open</span>
              </a>
            ))}
        </div>
      )}

      {post.poll && (
        <div className="space-y-2 px-4 pb-3">
          <p className="text-sm font-semibold text-foreground">📊 {post.poll.question}</p>
          {post.poll.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onVotePoll(post.id, option.id)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-xs hover:bg-secondary/40"
              >
                <span className="flex items-center justify-between">
                  <span>{option.text}</span>
                  <span className="text-muted-foreground">{option.votes} votes • {percentage}%</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{reactionMeta[post.userReaction ?? 'like'].emoji}</span>
          {totalReactions(post.reactions)} reactions
        </span>
        <div className="flex gap-3">
          <span>{totalComments(post.comments)} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <div className="group relative flex-1">
          <button className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            {reactionMeta[post.userReaction ?? 'like'].emoji}
            {reactionMeta[post.userReaction ?? 'like'].label}
          </button>
          <div className="pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-xl border border-border bg-card p-1 opacity-0 shadow-lg transition-all group-hover:pointer-events-auto group-hover:opacity-100">
            {(Object.keys(reactionMeta) as ReactionType[]).map((reaction) => (
              <button
                key={`${post.id}-${reaction}`}
                type="button"
                onClick={() => onReact(post.id, reaction)}
                className="rounded-md px-2 py-1 text-sm hover:bg-secondary"
                title={reactionMeta[reaction].label}
              >
                {reactionMeta[reaction].emoji}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button
          onClick={() => setShowShareComposer((prev) => !prev)}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Repeat2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <AnimatePresence>
        {showShareComposer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="space-y-2 p-4">
              <textarea
                value={shareCommentary}
                onChange={(e) => setShareCommentary(e.target.value)}
                placeholder="Add commentary to your repost (optional)"
                rows={2}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Repost
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-2.5">
                    <img src={comment.author.avatar} alt={comment.author.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 flex-1 rounded-xl bg-secondary px-3 py-2">
                      <p className="text-xs font-semibold text-foreground">{comment.author.name}</p>
                      <p className="text-xs text-foreground/80">{comment.content}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{comment.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => setReplyDrafts((prev) => ({ ...prev, [comment.id]: prev[comment.id] ?? '' }))}
                          className="text-primary"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {(comment.replies ?? []).slice(0, 5).map((reply) => (
                    <div key={reply.id} className="ml-10 flex gap-2.5">
                      <img src={reply.author.avatar} alt={reply.author.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1 rounded-xl bg-secondary/70 px-3 py-2">
                        <p className="text-xs font-semibold text-foreground">{reply.author.name}</p>
                        <p className="text-xs text-foreground/80">{reply.content}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{reply.createdAt}</p>
                      </div>
                    </div>
                  ))}

                  {replyDrafts[comment.id] !== undefined && (
                    <div className="ml-10 flex gap-2">
                      <input
                        value={replyDrafts[comment.id]}
                        onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                        placeholder="Write a reply..."
                        className="w-full rounded-xl border border-border bg-background py-2 pl-3 pr-3 text-xs text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(comment.id)}
                        className="rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2.5 pt-1">
                <img src={currentUser.avatar} alt={currentUser.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                <div className="relative flex-1">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full rounded-xl border border-border bg-background py-2 pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    aria-label="Send comment"
                    title="Send comment"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:opacity-70"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
