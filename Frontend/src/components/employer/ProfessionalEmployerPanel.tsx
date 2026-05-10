import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings,
    LogOut,
    Bell,
    ChevronRight,
    TrendingUp,
    Crown,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

interface Props {
    companyName?: string;
    hiringHealth?: "excellent" | "good" | "needs-attention";
}

export default function ProfessionalEmployerPanel({
    companyName = "CloudScale",
    hiringHealth = "excellent",
}: Props) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications] = useState(3);

    const healthConfig = {
        excellent: { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500", label: "Excellent" },
        good: { color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500", label: "Good" },
        "needs-attention": { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500", label: "Needs Attention" },
    };

    const health = healthConfig[hiringHealth];

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 border-b border-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg">
                                <img src={user?.avatar} alt={user?.name} className="w-full h-full rounded-2xl object-cover" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                <Crown className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{user?.name || "Demo Employer"}</h2>
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Employer Hub</p>
                        </div>
                    </div>

                    <button onClick={() => navigate("/notifications")} className="relative p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Bell className="w-5 h-5 text-slate-600" />
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{notifications}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Hiring Health */}
                <div className={`${health.bg} rounded-2xl p-4 border border-slate-200`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl">
                                <TrendingUp className={`w-5 h-5 ${health.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Hiring Health</p>
                                <p className={`text-sm font-bold ${health.color}`}>{health.label}</p>
                            </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${health.dot} animate-pulse`} />
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                    <button onClick={() => navigate("/settings")} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg group-hover:bg-blue-50 transition-colors">
                                <Settings className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">Settings & Privacy</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    </button>

                    <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg group-hover:bg-red-50 transition-colors">
                                <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-sm font-semibold text-red-700">Logout</span>
                        </div>
                        <span className="text-xs font-medium text-red-600">Sign out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
