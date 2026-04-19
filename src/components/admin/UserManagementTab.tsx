import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Search, ShieldAlert, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminUsers, type AdminUser } from "@/data/adminMockData";
import { toast } from "sonner";

const statusStyles: Record<AdminUser["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function UserManagementTab() {
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const updateStatus = (id: string, status: AdminUser["status"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    toast.success(`User ${status === "active" ? "reinstated" : status}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">User management</h2>
          <p className="text-sm text-muted-foreground">Search, filter, and moderate platform users.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserCog className="h-4 w-4" />
          {filtered.length} of {users.length} users
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="seeker">Job seekers</SelectItem>
            <SelectItem value="employer">Employers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${statusStyles[u.status]}`}>{u.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.joinedAt}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell>
                  {u.flagsCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-sm text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" /> {u.flagsCount}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    {u.status !== "active" ? (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(u.id, "active")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Reinstate
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => updateStatus(u.id, "suspended")}>
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No users match these filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
