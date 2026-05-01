import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Shield, Users, ArrowRight, Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth, type UserRole } from "@/features/auth/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "login" | "register";

const roleCards: Array<{
  role: UserRole;
  title: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    role: "seeker",
    title: "Job Seeker",
    description: "Access the social feed, profile tools, and smart job matches.",
    icon: Users,
  },
  {
    role: "employer",
    title: "Employer",
    description: "Manage company profile, jobs, applicants, interviews, and analytics.",
    icon: Briefcase,
  },
  {
    role: "admin",
    title: "Admin",
    description: "Monitor platform activity and oversee users, jobs, and reports.",
    icon: Shield,
  },
];

const demoCredentials: Record<UserRole, { email: string; password: string }> = {
  seeker: { email: "seeker@nexus.demo", password: "demo1234" },
  employer: { email: "employer@nexus.demo", password: "demo1234" },
  admin: { email: "admin@nexus.demo", password: "demo1234" },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form states
  const [loginData, setLoginData] = useState({
    email: demoCredentials.seeker.email,
    password: demoCredentials.seeker.password,
  });

  // Register form states
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (mode === "login") {
      setLoginData({
        email: demoCredentials[role].email,
        password: demoCredentials[role].password,
      });
    }
    setError(null);
  };

  // Clear error when typing in login form
  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Clear error when typing in register form
  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginData.email || !loginData.password) {
      setError("Email and password are required");
      return;
    }

    const result = await login({
      email: loginData.email,
      password: loginData.password,
      role: selectedRole,
    });

    if (!result.success) {
      setError(result.message ?? "Login failed. Please try again.");
      return;
    }

    setSuccess("Login successful! Redirecting...");
    setTimeout(() => {
      if (selectedRole === "employer") navigate("/employer");
      else if (selectedRole === "admin") navigate("/admin");
      else navigate("/");
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Trim all values
    const firstName = registerData.firstName.trim();
    const email = registerData.email.trim();
    const password = registerData.password.trim();
    const confirmPassword = registerData.confirmPassword.trim();

    // Validation
    if (!firstName) {
      setError("First name is required");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const result = await register({
        email: email,
        password: password,
        firstName: firstName,
        lastName: registerData.lastName.trim(),
        role: selectedRole,
      });

      if (!result.success) {
        setError(result.message ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created successfully! Logging in...");
      setTimeout(() => {
        // Auto-login after registration
        login({
          email: email,
          password: password,
          role: selectedRole,
        }).then((res) => {
          if (res.success) {
            if (selectedRole === "employer") navigate("/employer");
            else if (selectedRole === "admin") navigate("/admin");
            else navigate("/");
          }
        });
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Registration error:", errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500 opacity-20 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-2 items-center">
        {/* Left Panel - Branding & Role Selection */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-10">
            {/* Logo & Branding */}
            <div>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h1 className="mt-6 font-display text-5xl font-bold text-white">
                JobLink
              </h1>
              <p className="mt-3 text-lg text-blue-100">
                Your Professional Network for Opportunity
              </p>
              <p className="mt-2 text-blue-200/70">
                Connect, collaborate, and grow your career with industry leaders
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: "🎯", text: "Smart Job Matching" },
                { icon: "💼", text: "Professional Networking" },
                { icon: "📊", text: "Career Analytics" },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  className="flex items-center gap-3 text-blue-100"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-wider text-blue-300">
                Choose Your Role
              </p>
              <div className="grid gap-3">
                {roleCards.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedRole === item.role;
                  return (
                    <motion.button
                      key={item.role}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleRoleSelect(item.role)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30"
                          : "border-blue-400/30 bg-blue-400/10 hover:border-blue-400/60 hover:bg-blue-400/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isActive ? "bg-blue-500" : "bg-blue-400/30"
                        }`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-blue-200"}`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isActive ? "text-white" : "text-blue-100"}`}>
                            {item.title}
                          </h3>
                          <p className="text-xs text-blue-200/70">{item.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Right Panel - Auth Form */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-blue-400/30 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 lg:hidden">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-blue-300">
                {mode === "login" ? "Welcome back" : "Join our community"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">
                {mode === "login" ? "Sign in to JobLink" : "Create your account"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-blue-200/70">
                {mode === "login"
                  ? "Access your professional dashboard and opportunities"
                  : "Start building your professional network today"}
              </p>
            </div>

            {/* Toggle Mode */}
            <div className="flex gap-2 rounded-xl border border-blue-400/20 bg-blue-400/10 p-1">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "text-blue-200 hover:text-white"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => handleLoginInputChange("email", e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-12 w-full rounded-xl border border-blue-400/20 bg-blue-400/10 pl-12 pr-4 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => handleLoginInputChange("password", e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 w-full rounded-xl border border-blue-400/20 bg-blue-400/10 pl-12 pr-12 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-blue-400/50 hover:text-blue-400"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo hint */}
                  <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-3">
                    <p className="text-xs font-medium text-blue-300">Demo Credentials</p>
                    <p className="mt-1 text-xs text-blue-200/70">
                      Selected role auto-fills demo credentials or use your own account
                    </p>
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  {/* First Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type="text"
                        value={registerData.firstName}
                        onChange={(e) => handleRegisterInputChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                        className="h-12 w-full rounded-xl border border-blue-400/20 bg-blue-400/10 pl-12 pr-4 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type="text"
                        value={registerData.lastName}
                        onChange={(e) => handleRegisterInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className="h-12 w-full rounded-xl border border-blue-400/20 bg-blue-400/10 pl-12 pr-4 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => handleRegisterInputChange("email", e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-12 w-full rounded-xl border border-blue-400/20 bg-blue-400/10 pl-12 pr-4 text-white placeholder:text-blue-200/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-white">Password *</label>
                      {registerData.password.length >= 8 && (
                        <span className="text-xs text-green-400 font-semibold">✓ Strong</span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => handleRegisterInputChange("password", e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`h-12 w-full rounded-xl border pl-12 pr-12 text-white placeholder:text-blue-200/40 focus:outline-none focus:ring-2 transition-all ${
                          registerData.password.length >= 8
                            ? "border-green-400/40 bg-green-400/5 focus:border-green-400/60 focus:ring-green-500/30"
                            : "border-blue-400/20 bg-blue-400/10 focus:border-blue-400/60 focus:ring-blue-500/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-blue-400/50 hover:text-blue-400"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className={`mt-1 text-xs ${registerData.password.length >= 8 ? "text-green-400" : "text-blue-200/60"}`}>
                      {registerData.password.length === 0 ? "At least 8 characters" : `${registerData.password.length}/8 characters`}
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-white">Confirm Password *</label>
                      {registerData.password && registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
                        <span className="text-xs text-green-400 font-semibold">✓ Match</span>
                      )}
                      {registerData.password && registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                        <span className="text-xs text-red-400 font-semibold">✗ No match</span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-blue-400/50" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => handleRegisterInputChange("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`h-12 w-full rounded-xl border pl-12 pr-12 text-white placeholder:text-blue-200/40 focus:outline-none focus:ring-2 transition-all ${
                          registerData.confirmPassword && registerData.password === registerData.confirmPassword
                            ? "border-green-400/40 bg-green-400/5 focus:border-green-400/60 focus:ring-green-500/30"
                            : registerData.confirmPassword && registerData.password !== registerData.confirmPassword
                            ? "border-red-400/40 bg-red-400/5 focus:border-red-400/60 focus:ring-red-500/30"
                            : "border-blue-400/20 bg-blue-400/10 focus:border-blue-400/60 focus:ring-blue-500/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-blue-400/50 hover:text-blue-400"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Terms */}
            <p className="text-center text-xs text-blue-200/50">
              By signing in, you agree to our <a href="#" className="underline hover:text-blue-200">Terms</a> and{" "}
              <a href="#" className="underline hover:text-blue-200">Privacy Policy</a>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
