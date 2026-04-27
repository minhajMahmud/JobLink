import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Briefcase, Home, LogOut, Menu, MessageSquareText, Search, User, Users, X, ChevronDown, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { currentUser } from "@/data/mockData";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: Users, label: "Network", path: "/network" },
  { icon: MessageSquareText, label: "Messages", path: "/messages" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const profile = user ?? currentUser;

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-6 flex-1">
            <Link to="/" className="flex shrink-0 items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="font-display text-xl font-extrabold text-white">N</span>
              </div>
              <span className="hidden font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 sm:block">Nexus</span>
            </Link>

            <div className="relative max-w-md hidden sm:block w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search jobs, people, posts..."
                className="h-10 w-full rounded-2xl border border-border/50 bg-secondary/50 pl-10 pr-4 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground/70 hover:bg-secondary focus:border-blue-500/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <nav className="hidden items-center md:flex h-full gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex min-w-[72px] flex-col items-center justify-center gap-1 h-full px-2 transition-all duration-300 ${isActive ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? "" : "group-hover:-translate-y-0.5"}`}>
                    <item.icon
                      className={`h-[22px] w-[22px] transition-all duration-300 ${isActive ? "scale-110 drop-shadow-sm text-blue-600" : "opacity-80 group-hover:opacity-100 group-hover:text-foreground"}`}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    {/* Add subtle fill when active for premium feel */}
                    {isActive && (
                      <item.icon
                        className="h-[22px] w-[22px] absolute inset-0 text-blue-500/20 mix-blend-multiply scale-110"
                        strokeWidth={0}
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide transition-all ${isActive ? "text-blue-600" : "opacity-90"}`}>
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-blue-600"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center md:flex shrink-0 border-l border-border/50 pl-4 h-8 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 group focus:outline-none rounded-full p-0.5 hover:bg-secondary/50 transition-colors">
                  <img src={profile.avatar} alt={profile.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent transition-all duration-300 group-hover:ring-blue-500/50" />
                  <div className="hidden lg:flex flex-col items-start pr-1">
                    <span className="text-xs font-bold text-foreground leading-none">Me</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                      View Profile <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 shadow-lg">
                <div className="flex items-center gap-3 p-2 mb-2">
                  <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground line-clamp-1">{profile.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{"title" in profile ? (profile as any).title : ""}</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-blue-500/10 focus:text-blue-600 font-medium">
                    <User className="h-4 w-4" /> View Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-blue-500/10 focus:text-blue-600 font-medium">
                    <Settings className="h-4 w-4" /> Settings & Privacy
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer gap-2 py-2.5 rounded-lg text-red-500 focus:bg-red-500/10 focus:text-red-600 font-medium"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary/80 md:hidden transition-colors">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-40 overflow-hidden border-b border-border bg-card shadow-xl md:hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${isActive ? "bg-blue-500/10 text-blue-600" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-border/50" />
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <img src={profile.avatar} alt={profile.name} className="h-6 w-6 rounded-full object-cover" />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
                Settings & Privacy
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
