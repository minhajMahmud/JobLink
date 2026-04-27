import { useState } from "react";
import { Shield, Bell, Lock, User, Eye, History, Smartphone, Globe, ChevronRight, Activity, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const TABS = [
    { id: "account", label: "Account Preferences", icon: User, description: "Profile info, email, and preferences" },
    { id: "security", label: "Sign in & Security", icon: Lock, description: "Passwords, 2FA, and devices" },
    { id: "visibility", label: "Visibility", icon: Eye, description: "Who can see your profile and network" },
    { id: "communications", label: "Communications", icon: Bell, description: "Emails, pushes, and invites", link: "/settings/notifications" },
    { id: "data", label: "Data Privacy", icon: Shield, description: "Manage your data and activity" }
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground tracking-tight">Settings & Privacy</h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account, privacy, and security preferences.</p>
            </div>

            <div className="grid md:grid-cols-[280px_1fr] gap-8">
                {/* Settings Sidebar */}
                <div className="space-y-6">
                    <nav className="flex flex-col gap-2">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;

                            if (tab.link) {
                                return (
                                    <Link
                                        key={tab.id}
                                        to={tab.link}
                                        className="group flex flex-col gap-1 rounded-2xl px-4 py-3 transition-all hover:bg-secondary/60 text-left border border-transparent"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <tab.icon className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                                <span className="font-semibold text-foreground">{tab.label}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-8">{tab.description}</p>
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group flex flex-col gap-1 rounded-2xl px-4 py-3 transition-all text-left border
                    ${isActive
                                            ? "bg-blue-500/10 border-blue-500/20 shadow-sm"
                                            : "border-transparent hover:bg-secondary/60"
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <tab.icon className={`h-5 w-5 transition-colors ${isActive ? "text-blue-600" : "text-muted-foreground group-hover:text-foreground"}`} />
                                            <span className={`font-semibold transition-colors ${isActive ? "text-blue-700" : "text-foreground"}`}>{tab.label}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-8">{tab.description}</p>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Settings Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {activeTab === "account" && (
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border">
                                        <h2 className="text-xl font-bold font-display text-foreground">Profile Information</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and contact details.</p>
                                    </div>
                                    <div className="p-0">
                                        <ul className="divide-y divide-border">
                                            {["Name, location, and industry", "Personal demographic information", "Verifications"].map((item) => (
                                                <li key={item}>
                                                    <button className="w-full flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors group text-left">
                                                        <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors">{item}</span>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border">
                                        <h2 className="text-xl font-bold font-display text-foreground">Site Preferences</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Customize your general experience on the platform.</p>
                                    </div>
                                    <div className="p-0">
                                        <ul className="divide-y divide-border">
                                            <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-secondary/20 transition-colors group">
                                                <div className="mb-3 sm:mb-0">
                                                    <span className="font-medium text-foreground block">App Theme Appearance</span>
                                                    <span className="text-sm text-muted-foreground mt-1">Select your preferred color scheme.</span>
                                                </div>
                                                <div className="flex bg-secondary/50 rounded-xl p-1 gap-1 border border-border">
                                                    <button onClick={() => setTheme("dark")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${theme === 'dark' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Dark</button>
                                                    <button onClick={() => setTheme("light")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${theme === 'light' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Light</button>
                                                </div>
                                            </li>
                                            {["Language", "Content language", "Autoplay videos"].map((item) => (
                                                <li key={item}>
                                                    <button className="w-full flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors group text-left">
                                                        <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors">{item}</span>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-red-600">Danger Zone</h3>
                                        <p className="text-sm text-red-600/80 mt-1">Permanently close or hibernate your account.</p>
                                    </div>
                                    <button className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20 transition-colors">
                                        Close Account
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "security" && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border">
                                        <h2 className="text-xl font-bold font-display text-foreground">Account Access</h2>
                                        <p className="text-sm text-muted-foreground mt-1">Keep your account secure with robust authentication.</p>
                                    </div>
                                    <div className="p-0">
                                        <ul className="divide-y divide-border">
                                            <li>
                                                <button className="w-full flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors group text-left">
                                                    <div>
                                                        <span className="font-medium text-foreground block group-hover:text-blue-600 transition-colors">Change password</span>
                                                        <span className="text-sm text-muted-foreground mt-1">Last changed 3 months ago</span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </li>
                                            <li>
                                                <button className="w-full flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors group text-left">
                                                    <div>
                                                        <span className="font-medium text-foreground block group-hover:text-blue-600 transition-colors">Two-step verification</span>
                                                        <span className="text-sm font-semibold text-green-600 mt-1">Active</span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={logout} className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 transition-colors group text-left">
                                                    <div>
                                                        <span className="font-medium text-red-600 block transition-colors flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign out of all devices</span>
                                                        <span className="text-sm text-red-600/70 mt-1">Log out of every active session immediately.</span>
                                                    </div>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {(activeTab === "visibility" || activeTab === "data") && (
                            <motion.div
                                key="other"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/20"
                            >
                                <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Section Under Construction</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-sm">We are rolling out advanced privacy metrics and data control ports tailored for enterprise standards very soon.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
