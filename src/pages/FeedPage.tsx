import { useState } from "react";
import { posts as initialPosts, currentUser, Post } from "@/data/mockData";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import SuggestedConnections from "@/components/feed/SuggestedConnections";
import TrendingTopics from "@/components/feed/TrendingTopics";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleNewPost = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser,
      content,
      likes: 0,
      comments: [],
      shares: 0,
      liked: false,
      createdAt: "Just now",
    };
    setPosts([newPost, ...posts]);
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
          <TrendingTopics />
        </div>
      </aside>

      {/* Main Feed */}
      <div className="lg:col-span-6 space-y-4">
        <CreatePost onPost={handleNewPost} />
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
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
