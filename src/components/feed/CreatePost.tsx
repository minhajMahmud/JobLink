import { useState } from "react";
import { Image, Send, Smile } from "lucide-react";
import { currentUser } from "@/data/mockData";
import { motion } from "framer-motion";

interface CreatePostProps {
  onPost: (content: string) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content);
      setContent("");
      setFocused(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="What's on your mind?"
            rows={focused ? 3 : 1}
            className="w-full resize-none rounded-xl border-none bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
          />
          {focused && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 flex items-center justify-between"
            >
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <Image className="h-4 w-4 text-primary" />
                  Photo
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <Smile className="h-4 w-4 text-warning" />
                  Feeling
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                Post
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
