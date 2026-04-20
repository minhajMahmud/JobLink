import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Shield, Users, ArrowRight } from "lucide-react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

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
  seeker: { email: "seeker@nexus.demo", password: "demo123" },
  employer: { email: "employer@nexus.demo", password: "demo123" },
  admin: { email: "admin@nexus.demo", password: "demo123" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("seeker");
  const [email, setEmail] = useState(demoCredentials.seeker.email);
  const [password, setPassword] = useState(demoCredentials.seeker.password);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login({ email, password, role: selectedRole });

    if (selectedRole === "employer") {
      navigate("/employer");
      return;
    }

    if (selectedRole === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-card sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.14),transparent_30%)]" />
          <div className="relative">
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <span className="font-display text-2xl font-bold">N</span>
            </div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Smart Job Networking Platform</p>
            <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Choose your panel and enter Nexus with the right workspace.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Sign in as a Job Seeker, Employer, or Admin. Each role opens a dedicated panel tailored to its workflow.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roleCards.map((item) => {
                const Icon = item.icon;
                const isActive = selectedRole === item.role;

                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleSelect(item.role)}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-elevated"
                        : "border-border bg-background hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-card sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Demo login</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Sign in to continue</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Selecting a role auto-fills demo credentials for that panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Current panel</p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {roleCards.find((item) => item.role === selectedRole)?.title}
              </p>
            </div>

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enter panel
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
