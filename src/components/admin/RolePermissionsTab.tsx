import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { rolePermissions, type RolePermission } from "@/data/adminMockData";
import { toast } from "sonner";

const roleStyles: Record<RolePermission["role"], string> = {
  seeker: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  employer: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
};

export default function RolePermissionsTab() {
  const [roles, setRoles] = useState<RolePermission[]>(rolePermissions);

  const toggle = (role: RolePermission["role"], permName: string, allowed: boolean) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.role === role
          ? { ...r, permissions: r.permissions.map((p) => (p.name === permName ? { ...p, allowed } : p)) }
          : r,
      ),
    );
    toast.success(`${permName} ${allowed ? "granted" : "revoked"} for ${role}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Role-based access control</h2>
        <p className="text-sm text-muted-foreground">Define what each role can do on the platform.</p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="font-medium">Three-tier RBAC enforced platform-wide</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Seekers, Employers, and Admins each see a tailored UI and route guard. Permissions changed here apply on next login.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {roles.map((r) => (
          <div key={r.role} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold capitalize text-foreground">{r.role}</h3>
              <Badge variant="outline" className={`capitalize ${roleStyles[r.role]}`}>{r.role}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.permissions.filter((p) => p.allowed).length} of {r.permissions.length} permissions enabled
            </p>

            <div className="mt-4 space-y-3">
              {r.permissions.map((p) => {
                const isLocked = r.role === "admin" && p.allowed;
                return (
                  <div key={p.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="text-sm text-foreground">{p.name}</span>
                    </div>
                    <Switch
                      checked={p.allowed}
                      disabled={isLocked}
                      onCheckedChange={(v) => toggle(r.role, p.name, v)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
