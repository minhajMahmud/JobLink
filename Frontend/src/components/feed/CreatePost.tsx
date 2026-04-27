import { useState } from "react";
import { CalendarClock, FileText, Image, Link2, ListChecks, Send } from "lucide-react";
import { currentUser, extractHashtags, type PollData, type PostAttachment, type PostVisibility } from "@/data/mockData";
import { motion } from "framer-motion";

export interface CreatePostPayload {
  content: string;
  visibility: PostVisibility;
  attachments: PostAttachment[];
  poll?: PollData;
  scheduledFor?: string;
  hashtags: string[];
}

interface CreatePostProps {
  onPost: (payload: CreatePostPayload) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState("Option A, Option B");
  const [scheduledFor, setScheduledFor] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      const now = Date.now();
      const attachments: PostAttachment[] = [
        imageUrl.trim()
          ? { id: `img-${now}`, type: 'image', url: imageUrl.trim(), title: 'Image attachment' }
          : null,
        videoUrl.trim()
          ? { id: `vid-${now}`, type: 'video', url: videoUrl.trim(), title: 'Video link' }
          : null,
        documentUrl.trim()
          ? { id: `doc-${now}`, type: 'document', url: documentUrl.trim(), title: 'Document link' }
          : null,
      ].filter((item): item is PostAttachment => Boolean(item));

      const parsedPollOptions = pollOptions
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)
        .slice(0, 4);

      const poll = pollQuestion.trim() && parsedPollOptions.length >= 2
        ? {
            question: pollQuestion.trim(),
            options: parsedPollOptions.map((text, index) => ({
              id: `poll-${now}-${index + 1}`,
              text,
              votes: 0,
            })),
          }
        : undefined;

      onPost({
        content: content.trim(),
        visibility,
        attachments,
        poll,
        scheduledFor: scheduledFor || undefined,
        hashtags: extractHashtags(content),
      });

      setContent("");
      setVisibility('public');
      setImageUrl("");
      setVideoUrl("");
      setDocumentUrl("");
      setPollQuestion("");
      setPollOptions("Option A, Option B");
      setScheduledFor("");
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
              className="mt-3 space-y-3"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-muted-foreground">
                  Visibility
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections only</option>
                    <option value="private">Private</option>
                  </select>
                </label>

                <label className="text-xs text-muted-foreground">
                  Schedule for later
                  <div className="mt-1 flex items-center rounded-lg border border-border bg-background px-2">
                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="h-9 w-full border-none bg-transparent px-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-muted-foreground">
                  <span className="mb-1 inline-flex items-center gap-1"><Image className="h-3.5 w-3.5 text-primary" />Image URL</span>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  />
                </label>

                <label className="text-xs text-muted-foreground">
                  <span className="mb-1 inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5 text-primary" />Video link</span>
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="YouTube / Vimeo URL"
                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  />
                </label>

                <label className="text-xs text-muted-foreground">
                  <span className="mb-1 inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-primary" />Document link</span>
                  <input
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="PDF / doc URL"
                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-muted-foreground">
                  <span className="mb-1 inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5 text-primary" />Poll question (optional)</span>
                  <input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What do you think about...?"
                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  />
                </label>

                <label className="text-xs text-muted-foreground">
                  Poll options (comma separated)
                  <input
                    value={pollOptions}
                    onChange={(e) => setPollOptions(e.target.value)}
                    placeholder="Option A, Option B"
                    className="h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Tip: hashtags in your post (like #React) boost discoverability.</p>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  {scheduledFor ? 'Schedule post' : 'Post'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
