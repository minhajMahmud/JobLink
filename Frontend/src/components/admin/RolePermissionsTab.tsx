import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { rolePermissions } from "@/data/adminMockData";
import { adminService } from "@/modules/admin/services/adminService";
import { toast } from "sonner";

type EnterpriseRole = "admin";

interface RolePermissionView {
  role: EnterpriseRole;
  permissions: { name: string; allowed: boolean }[];
}

const roleStyles: Record<EnterpriseRole, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
};

export default function RolePermissionsTab() {
  const [roles, setRoles] = useState<RolePermissionView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const matrix = await adminService.getRbacMatrix();

        const allowedPermissions = matrix.matrix.admin ?? [];
        setRoles([
          {
            role: "admin",
            permissions: matrix.permissions.map((permission) => ({
              name: permission,
              allowed: allowedPermissions.includes("*") || allowedPermissions.includes(permission),
            })),
          },
        ]);
      } catch {
        setRoles([
          {
            role: "admin",
            permissions: [
              { name: "users.view", allowed: true },
              { name: "users.manage", allowed: true },
              { name: "employers.verify", allowed: true },
              { name: "posts.moderate", allowed: true },
              { name: "jobs.moderate", allowed: true },
              { name: "reports.resolve", allowed: true },
              { name: "analytics.view", allowed: true },
              { name: "rbac.manage", allowed: true },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const toggle = (role: EnterpriseRole, permName: string, allowed: boolean) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.role === role
          ? { ...r, permissions: r.permissions.map((p) => (p.name === permName ? { ...p, allowed } : p)) }
          : r,
      ),
    );
    toast.success(`${permName} ${allowed ? "granted" : "revoked"} for ${role.replace("_", " ")}`);
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
          <p className="font-medium">Four-tier RBAC enforced platform-wide</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Single-admin access model with scoped platform permissions.</p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading RBAC matrix...
        </div>
      )}

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
                return (
                  <div key={p.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{p.name}</span>
                    </div>
                    <Switch
                      checked={p.allowed}
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
