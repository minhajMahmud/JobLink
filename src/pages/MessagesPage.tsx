import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-16 shadow-card text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-4 text-xl font-semibold font-display text-foreground">Messages</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Your conversations will appear here. Connect with professionals to start messaging.
        </p>
      </div>
    </div>
  );
}
