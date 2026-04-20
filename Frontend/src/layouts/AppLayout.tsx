import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Briefcase, Home, LogOut, Menu, MessageSquare, Search, User, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { currentUser } from "@/data/mockData";
import { useAuth } from "@/features/auth/context/AuthContext";
import NotificationsBell from "@/features/notifications/components/NotificationsBell";

const navItems = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: Users, label: "Network", path: "/network" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const profile = user ?? currentUser;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-lg font-bold text-primary-foreground">N</span>
            </div>
            <span className="hidden font-display text-xl font-bold text-foreground sm:block">Nexus</span>
          </Link>

          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, people, posts..."
              className="h-10 w-full rounded-xl border border-border bg-secondary pl-10 pr-4 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <motion.div layoutId="nav-indicator" className="absolute -bottom-[9px] left-2 right-2 h-0.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <NotificationsBell variant="header" />
            <Link to="/profile" className="shrink-0">
              <img src={profile.avatar} alt={profile.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-border transition-all hover:ring-primary" />
            </Link>
            <button type="button" onClick={logout} className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-border bg-card p-4 shadow-elevated md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
