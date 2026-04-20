import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { Post } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

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
            <p className="text-xs text-muted-foreground">{post.createdAt}</p>
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
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">♥</span>
          {likeCount}
        </span>
        <div className="flex gap-3">
          <span>{post.comments.length} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <button
          onClick={toggleLike}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            liked ? "text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

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
                <div key={comment.id} className="flex gap-2.5">
                  <img src={comment.author.avatar} alt={comment.author.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                  <div className="rounded-xl bg-secondary px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">{comment.author.name}</p>
                    <p className="text-xs text-foreground/80">{comment.content}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2.5 pt-1">
                <div className="h-8 w-8 shrink-0" />
                <div className="relative flex-1">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full rounded-xl border border-border bg-background py-2 pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
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
